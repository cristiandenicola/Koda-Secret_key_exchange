import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

const Chats = () => {

  const [chats, setChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch, data } = useContext(ChatContext);

  const decryptMessage = (chat, key) => { //questo dovrebbe essere corretto guardando come fatto in messages
    try {
      const decryptedText = CryptoJS.AES.decrypt(chat.lastMessage?.text, key).toString(CryptoJS.enc.Utf8);
            return {
              ...chat,
              lastMessage: {
                text: decryptedText,
              },
            };
    } catch (error) {
      return chat;
    }
  };

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
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

  function renderChats(chats) {
    try {
      return Object.entries(chats)
        .sort((a,b) => b[1].date - a[1].date)
        .map((chat) => (
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
        ));
    } catch (error) {}
  }
    
  return (
    <div className="chats">{renderChats(chats)}</div>
  );
};

export default Chats;