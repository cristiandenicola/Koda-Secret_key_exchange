import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

/**
 * @description Component inglobato in sidebar, viene sviluppato nel momento in cui l'utente ricerca un altro utente nel search.
 * sono le chat dell'utente che vengono viste a sinistra, che presenta, immagine, nome e ultimo messaggio che l'utente ha scambiato con un altro.
 * @param chats const useState che conterrà tutte le chat dell'utente in questione (chats che vengono scaricate dal db)
 * @param sessionKey const che contiene la key di sessione calcolata in chatContext, usata per decifrare l'ultimo messaggio della chat (criptato)
 * @param currentUser const che tiene traccia dell'utente in sessione, cosi da avere un indice per le ricerche nel db
 * @param status const che tiene traccia dello status dell'utente (online/offline) per gestire un componente UI.
 * @returns 
 */
const Chats = () => {
  
  const [chats, setChats] = useState([]);
  const [sessionKey, setSessionKey] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { dispatch, data } = useContext(ChatContext);
  const [status, setStatus] = useState(false);
  
  /**
   * @description funzione usata per decifrare l'ultimo messaggio della chat (che ovviamente viene preso dal db cifrato).
   * alla decifratura viene aggiunto .toString(CryptoJS.enc.Utf8) per consentire la corretta visualizzazione del messaggio.
   * @param {*} message messaggio in questione da decifrare
   * @param {*} key chiave di sessione usata per decifrare il messaggio
   * @returns 
   */
  const decryptMessage = (message, key) => {
    try {
      const decryptedText = CryptoJS.AES.decrypt(message, key).toString(CryptoJS.enc.Utf8);
      return decryptedText;
    } catch (error) {
      return message;
    }
  };

  /**
   * @description funzione usata per leggere dal db lo status dell'utente che rappresenta la chat; in questo modo posso gestire correttamente
   * il component UI che viene settato col valore di questa funzione.
   * @param {*} uid usato come chiave per selezionare l'utente corretto nel db
   * @returns status (boolean)
   */
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
  
  /**
   * @description metodo useEffect, che viene lanciato ogni volta che il component viene renderizzato.
   * questo per prima cosa controlla che l'utente sia loggato e poi tramite il suo UID pesca dal db (collezione userChats) le chat dello user
   * e le setta dentro chats.
   */
  useEffect(() => {
    if (!currentUser.uid) return;

    const unsubscribe = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
      setChats(doc.data());
    });

    return unsubscribe;
  }, [currentUser.uid]);
  
  /**
   * @description secondo useEffect, usato per ottenere la chiave di sessione; in particolare aspetta la promise, la risolve e infine setta il valore ottenuto
   * all'interno di sessionKey. 
   */
  useEffect(() => {
    try {
      if (data.sessionKey) {
        data.sessionKey.then((value) => {
          setSessionKey(value);
        });
      }
    } catch (error) {}
  }, [data.sessionKey]);

  /**
   * @description terzo useEffect, questo è usato per ottenere lo status dell'utente con un clock di 2 secondi. 
   * ongi 2 secondi viene lanciato il metodo fetchData, che esegue il metodo @retrieveDestStatus per ottenere lo status e inserirlo all'interno di status
   */
  useEffect(() => {
    const fetchData = async () => {
      const newStatus = await retrieveDestStatus(data.user.uid);
      setStatus(newStatus);
    };

    fetchData();

    const interval = setInterval(fetchData, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [data.user.uid]);
  
  /**
   * @description funzione che viene eseguita quando viene cliccata una chat, semplicemente viene dato il focus a quella chat e viene chiamato il dispatch
   * presente in chatContext per cambiare user e quindi chat.
   * @param {*} u user
   */
  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };
  
  /**
   * @description funzione usata per renderizzare le chat (da info a UI vera e propria).
   * per prima cosa aspetto la risoluzione della promise e controllo se sessionKey esista, poi viene eseguito un Object.entries di chats,
   * ordinate da messaggio più recente a quello più vecchio e poi eseguito il map su di essa.
   * viene settato lo status con la const status in userChatImg (semplice dot verde se on grigio se off);
   * in pMessage avviene la decifratura del lastMessage, dove viene dato in pasto alla funzione di decifratura e se è contenuta la stringa /hide
   * non viene displayato il messaggio in chiaro nel component.
   * @param {*} chats 
   * @returns 
   */
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
          )
        );
      };
    } catch (error) { return null; }
  }
    
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

export default Chats;