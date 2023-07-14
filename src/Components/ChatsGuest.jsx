import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";


const ChatsGuest = () => {
    
    const [chats, setChats] = useState([]);
    const [sessionKey, setSessionKey] = useState(null);
    const { currentUser } = useContext(AuthContext);
    const { dispatch, data } = useContext(ChatContext);
    const [status, setStatus] = useState(false);
    
    
    const decryptMessage = (message, key) => {
        try {
            const decryptedText = CryptoJS.AES.decrypt(message, key).toString(CryptoJS.enc.Utf8);
            return decryptedText;
        } catch (error) {
            return message;
        }
    };

    const retrieveDestStatus = async (uid) => {
        try {
            const q = query(collection(db, "users"), where("uid", "==", uid));
            try {
                const querySnapshot = await getDocs(q);
                let newStatus = false;
    
                querySnapshot.forEach((doc) => {
                    newStatus = doc.data().isOnline;
                });
    
                return newStatus;
            } catch (error) {
                console.log(error);
                return false;
            }
        } catch (error) {}
    };
    
    useEffect(() => {
        if (!currentUser.uid) return;
        
        const unsubscribe = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
            setChats(doc.data());
        });
        
        return unsubscribe;
    }, [currentUser.uid]);
    
    useEffect(() => {
        try {
            if (data.sessionKey) {
                data.sessionKey.then((value) => {
                    setSessionKey(value);
                });
            }
        } catch (error) {}
    }, [data.sessionKey]);
    
    useEffect(() => {
        const fetchData = async () => {
            const newStatus = await retrieveDestStatus(data.user.uid);
            setStatus(newStatus);
        };
    
        fetchData();
    
        const interval = setInterval(fetchData, 2000); // Esegui la funzione ogni 2 secondi
    
        return () => {
            clearInterval(interval); // Pulisci l'intervallo alla disconnessione del componente
        };
    }, [data.user.uid]);

    const handleSelect = (u) => {
        dispatch({ type: "CHANGE_USER", payload: u });
    };
    
    function renderChats(chats) {
        try {
            if(data.sessionKey) {
                return Object.entries(chats)
                .sort((a,b) => b[1].date - a[1].date)
                .map((chat) => (
                    <div
                        className="userChat"
                        key={chat[0]}
                        onClick={() => handleSelect(chat[1].userInfo)}
                        style={{backgroundColor:'#474242'}}
                    >
                        <img className="userChatImg" src={chat[1].userInfo.photoURL} alt="" />
                        {
                            status === true ? (
                                <div className="divOnline"></div>
                            ) : status === false ? (
                                <div className="divOffline"></div>
                            ) : (
                                <div className="divOnline"></div>
                            )
                        }
                        <div className="userChatInfo">
                            <span className="spanName">{chat[1].userInfo.displayName}</span>
                            <p className="pMessage" style={{marginBottom:'0px'}}>
                                {chat[1].lastMessage?.text == null 
                                    ? "Start the conversation" 
                                    : (() => {
                                        const decryptedText = decryptMessage(chat[1].lastMessage?.text, sessionKey);
                                        return decryptedText.includes('/hide') ? "Hide message received" : decryptedText;
                                    }) ()
                                }
                            </p>
                        </div>
                    </div>
                ));
            };
        } catch (error) { return null; }
    };
        
    return (
        <div className="chats">
            {!data.selectedUser ?
                <p 
                    style={{
                        display:'flex', 
                        alignItems:'center', 
                        justifyContent:'center', 
                        color:'#ddddf7', 
                        fontSize:'11px', 
                        marginTop:'20px'
                    }}
                >
                    Your chats will be displayed here
                </p> 
                : <p></p>
            }
            {renderChats(chats)}
        </div>
    );
};
        
export default ChatsGuest;