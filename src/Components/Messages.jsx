import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

const Messages = () => {

    const [messages, setMessages] = useState([]);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;

    const decryptMessage = (message, key) => {
        try {
            const decryptedText = CryptoJS.AES.decrypt(message.text, key).toString(CryptoJS.enc.Utf8);
            return {
                ...message,
                text: decryptedText,
            };
        } catch (error) {
            return message;
        }
    };

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if(doc.exists()) {
                const docData = doc.data();
                if(docData && docData.messages) {
                    const encryptedMessages = docData.messages;                 
                    setMessages(encryptedMessages);

                    if(data.sessionKey) {
                        try {
                            data.sessionKey.then((value) => {
                                SESSION_KEY = value;
                                if (encryptedMessages && encryptedMessages.length > 0) {
                                    const decrypted = encryptedMessages.map((message) => decryptMessage(message, SESSION_KEY));
                                    setMessages(decrypted);
                                }
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
        });

        return () => {
            unSub();
        };
    }, [data.chatId, data.sessionKey]);


    return (
        <div className="messages">
            {!data.selectedUser ? (
                <div style={{alignItems:'center', justifyContent:'center', display: 'flex', flexDirection:'column', padding:'10px'}}>
                    <iframe src="https://embed.lottiefiles.com/animation/91574" style={{width:'400px', height:'400px'}}></iframe>
                    <p style={{fontSize:'16px', fontWeight:'bold', marginTop:'-70px'}}>Search for starting a new conversation..</p>
                </div>
            ) : (
                <p></p>
            )}
            {messages.map((m, index) => (
                <Message message={m} key={index} />
            ))}
        </div>
    );
};

export default Messages;
