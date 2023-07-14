import React, { useContext, useState, useEffect } from "react";
import { MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { Timestamp, serverTimestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import CryptoJS from "crypto-js";


const Input = () => {
    
    const [text, setText] = useState("");
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;
    let status;
    
    const handleKey = (e) => {
        e.code === "Enter" && handleSend();
    };
    
    const encryptMessage = (message, key) => {
        try {
            const utf8Text = CryptoJS.enc.Utf8.parse(message)
            const encryptedMessage = CryptoJS.AES.encrypt(utf8Text, key).toString();
            return encryptedMessage;
        } catch (error) {
            console.error(error)
        }
    }
    
    const retrieveDestStatus = async (uid) => {
        const q = query (collection(db, "users"), where("uid", "==", uid));          
        let status = false;

        try {
            const querySnapshot = await getDocs(q);
                
            querySnapshot.forEach((doc) => {
                status = doc.data().isOnline;
            });
        } catch (error) {
            console.log(error)
            status = false;
        }
        return status;
    };

    const handleSend = async () => {
        if(text === ""){
            console.log("messaggio non valido");
        } else {
            try {
                if(data && data.chatId && data.sessionKey) {
                    SESSION_KEY = await data.sessionKey;
                    status = await retrieveDestStatus(data.user.uid)
                        
                    if(SESSION_KEY === undefined || !status) {
                        alert("l'utente al momento è offline, non è possibile comunicare");
                        setText("")
                    } else {
                        try {
                            let encryptedMessage = encryptMessage(text, SESSION_KEY);
                            updateDoc(doc(db, "chats", data.chatId), {
                                messages: arrayUnion({
                                    id: uuid(),
                                    text: encryptedMessage,
                                    senderId: currentUser.uid,
                                    date: Timestamp.now(),
                                }),
                            });
                                
                            updateDoc(doc(db, "userChats", currentUser.uid), {
                                [data.chatId + ".lastMessage"]: {
                                    text: encryptedMessage,
                                },
                                [data.chatId + ".date"]: serverTimestamp(),
                            });
                                
                            updateDoc(doc(db, "userChats", data.user.uid), {
                                [data.chatId + ".lastMessage"]: {
                                    text: encryptedMessage,
                                },
                                [data.chatId + ".date"]: serverTimestamp(),
                            });
                                
                            setText("");
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
            } catch (error) {
                alert("Crea una chat per iniziare!");
                setText("");
            }
        }
    };
        
    return (
        <div className="input">
            <div className="inputType">
                <MDBInput 
                    className="inputText" 
                    label='Type something...' 
                    id='formName' 
                    type='text' 
                    size="sm" 
                    onKeyDown={handleKey} 
                    value={text} onChange={(e) => setText(e.target.value)} 
                    style={{backgroundColor:'white'}}
                />
                <div className="send">
                    <MDBBtn rounded size="sm" color='light' rippleColor='dark' onClick={handleSend}>
                    <MDBIcon fas icon='paper-plane' />
                    </MDBBtn>
                </div>
            </div>
        </div>
    );
};

export default Input;