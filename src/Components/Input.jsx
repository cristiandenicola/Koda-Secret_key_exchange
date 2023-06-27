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
    //const [encryptedMessage, setEncryptedMessage] = useState ("");

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;

    const handleKey = (e) => {
        e.code === "Enter" && handleSend();
    };

    const encryptMessage = (message, key) => {
        const utf8Text = CryptoJS.enc.Utf8.parse(message)
        const encryptedMessage = CryptoJS.AES.encrypt(utf8Text, key).toString();
        return encryptedMessage;
    }

    const handleSend = async () => {
        if(text === ""){
            //controllo dell'input in caso il mex sia vuoto non viene inviato nulla
            console.log("messaggio non valido");
        } else {
            try {
                if(data && data.chatId && data.sessionKey) {
                    data.sessionKey.then(
                        value => {
                            SESSION_KEY = value
                            
                            updateDoc(doc(db, "chats", data.chatId), { //metodo usato per salvare dentro il db il messaggio
                                messages: arrayUnion({
                                    id: uuid(),
                                    text: encryptMessage(text, SESSION_KEY),
                                    senderId: currentUser.uid,
                                    date: Timestamp.now(),
                                }),
                            });
        
                            updateDoc(doc(db, "userChats", currentUser.uid), { //metodo usato x salvare in userChats mittente l'ultimo mex
                                [data.chatId + ".lastMessage"]: {
                                    text: encryptMessage(text, SESSION_KEY),
                                },
                                [data.chatId + ".date"]: serverTimestamp(),
                            });
                          
                            updateDoc(doc(db, "userChats", data.user.uid), { //metodo usato x salvare in userChats destinatario l'ultimo mex
                                [data.chatId + ".lastMessage"]: {
                                    text: encryptMessage(text, SESSION_KEY),
                                },
                                [data.chatId + ".date"]: serverTimestamp(),
                            });
                              
                            setText("");
                        }
                    )
                }
            } catch (error) {
                console.error(error);
                console.log("seleziona una chat per iniziare!")
            }
        }
    };

    return (
        <div className="input">
            <div className="inputType">
                <MDBInput className="prova" label='Type something...' id='formName' type='text' size="sm" onKeyDown={handleKey} value={text} onChange={(e) => setText(e.target.value)} style={{backgroundColor:'white'}}/>
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


