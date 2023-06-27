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
        const decryptedMessage = CryptoJS.AES.decrypt(message, key).toString();
        return decryptedMessage;
    }

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            doc.exists() && setMessages(doc.data().messages);
        });

        return () => {
            unSub();
        };
    }, [data.chatId]);

    return (
        <div className="messages">
            {messages.map((m) => (
                <Message message={m} key={m.id} />
            ))}
        </div>
    );
};

export default Messages;


