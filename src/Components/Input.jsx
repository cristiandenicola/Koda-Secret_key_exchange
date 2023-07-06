import React, { useContext, useState } from "react";
import {
    MDBInput,
    MDBBtn,
    MDBIcon
} from 'mdb-react-ui-kit';
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { Timestamp, serverTimestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import CryptoJS from "crypto-js";


const Input = () => {

    const [text, setText] = useState("");

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;

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

    const handleSend = async () => {
        if(text === ""){
            console.log("messaggio non valido");
        } else {
            try {
                if(data && data.chatId && data.sessionKey) {
                    data.sessionKey.then(
                        value => {
                            SESSION_KEY = value;
                            if(SESSION_KEY === undefined) {
                                alert("l'utente al momento è offline, non è possibile comunicare");
                            } else {
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
                            }
                        }
                    )
                }
            } catch (error) {
                console.error(error);
                alert("Crea una chat per iniziare!");
                setText("");
            }
        }
    };

    return (
        <div className="input">
            <div className="inputType">
                <MDBInput className="inputText" label='Type something...' id='formName' type='text' size="sm" onKeyDown={handleKey} value={text} onChange={(e) => setText(e.target.value)} style={{backgroundColor:'white'}}/>
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


