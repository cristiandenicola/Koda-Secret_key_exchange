import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";


const Messages = () => {

    const [messages, setMessages] = useState([]);
    const [decryptedMessages, setDecryptedMessages] = useState([]);
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
            //console.error(error) se scommentato dice che i messaggi sono deformi ma decifratura funziona
            return message;
        }
    };

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if(doc.exists()) {
                const docData = doc.data(); //OK
                if(docData && docData.messages) {
                    const encryptedMessages = docData.messages; //OK                    
                    setMessages(encryptedMessages);

                    if(data.sessionKey) {
                        data.sessionKey.then((value) => {
                            SESSION_KEY = value;
                            if (encryptedMessages && encryptedMessages.length > 0) {
                                const decrypted = encryptedMessages.map((message) => decryptMessage(message, SESSION_KEY));
                                setMessages(decrypted);
                            }
                        });
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
            {messages.map((m, index) => (
                <Message message={m} key={index} />
            ))}
        </div>
    );
};

export default Messages;


