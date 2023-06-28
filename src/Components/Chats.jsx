import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const Chats = () => {

  const [chats, setChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch, data } = useContext(ChatContext);
  let SESSION_KEY;

  const decryptMessage = (chat, key) => {
    try {
      
    } catch (error) {
        return chat;
    }
  };

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        if(doc.exists()) {
          const docData = doc.data();
          if(docData) {
            const encryptedChat = docData;
            setChats(encryptedChat);
          }
        }
      });

      return () => {
        unsub();
      };
    };
    
    currentUser.uid && getChats();
  }, [currentUser.uid, data.sessionKey]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };
    
  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <img className="userChatImg" src={chat[1].userInfo.photoURL} alt="" />
          <div className="userChatInfo">
            <span className="spanName">{chat[1].userInfo.displayName}</span>
            <p className="pMessage">{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;