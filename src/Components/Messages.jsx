import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

/**
 * @description Component inglobato all'interno di Chat, è usato in primis come component grafico in cui è presente l'i-frame iniziale
 * e poi contiene il map dei messaggi, quindi rappresenta la visualizzazione vera e propria della conversazione tra i due utenti
 * @param messages const con all'interno i messaggi presi dalla collection 'chats'
 * @param data param preso dal ChatContext in cui risiedono dati essenziati dell'altro utente e della sessione della chat
 * @param SESSION_KEY contiene il valore della chiave di sessione usata per la decifratura dei ciphertext
 * @returns 
 */
const Messages = () => {

    const [messages, setMessages] = useState([]);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;

    /**
     * @description metodo usato per la decifratura dei ciphertext scaricati dal db.
     * per prima cosa viene richiamato il metodo AES.decrypt dove gli do in pasto il messaggio e la chiave di sessione,
     * poi ricostruisco l'albero del document in modo che poi in seguito venga gestito come deve
     * @param {*} message ciphertext da decifrare
     * @param {*} key chiave di sessione
     * @returns 
     */
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

    /**
     * @description useEffect usato per scaricare, quindi leggere i ciphertext (messaggi) dal db.
     * per prima cosa viene fatto un controllo per verificare che la collezione esista, e nel caso di esito positivo vengono caricati i chipertext all'interno di messages.
     * poi viene verificata l'esistenza della sessionKey e anche qui, in caso di esito positivo, aspetto la risoluzione della promise e poi viene fatto un map di tutti i ciphertext
     * e vengono dati in pasto a turno alla funzione @decryptMessage per ottenere i plain correttamente.
     */
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
