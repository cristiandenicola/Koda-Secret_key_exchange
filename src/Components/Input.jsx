import React, { useContext, useState } from "react";
import { MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { Timestamp, serverTimestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import CryptoJS from "crypto-js";

/**
 * @description Component usato per gestire l'invio del messaggio, il suo salvataggio e la sua cifratura all'interno dell'app.
 * è inglobato all'interno del macrocomponent Chat.
 * @param text param che contiene il messaggio (plain) inserito dall'utente 
 * @param currentUser const che tiene traccia dell'utente in sessione, cosi da avere un indice per le ricerche nel db
 * @param data param preso dal ChatContext in cui risiedono dati essenziati dell'altro utente e della sessione della chat
 * @param SESSION_KEY param che rappresenta la chiave di sessione da utilizzare per cifrare il messaggio (plain) inserito dall'utente
 * @param status param che tiene traccia dello stato dell'utente, in modo che quando e se va off la conversazione non può più proseguire (x via della chiave e del fatto di essere effimero).
 * @returns 
 */
const Input = () => {
    
    const [text, setText] = useState("");
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    let SESSION_KEY;
    let status;
    
    /**
     * @description semplice funzione che gestisce l'invio del messaggio tramite il tasto 'enter'
     * richiama il metodo handleSend
     * @param {*} e 
     */
    const handleKey = (e) => {
        e.code === "Enter" && handleSend();
    };
    
    /**
     * @description metodo usato per la cifratura del messaggio, quindi da plain a cipher
     * per prima cosa converte il plain inserito in utf8, poi passa plainUtf8 e la chiave di sessione alla funzione di cifratura.
     * per la cifratura è stato usato AES
     * @param {*} message plain da cifrare
     * @param {*} key chiave di sessione
     * @returns encryptedMessage
     */
    const encryptMessage = (message, key) => {
        try {
            const utf8Text = CryptoJS.enc.Utf8.parse(message)
            const encryptedMessage = CryptoJS.AES.encrypt(utf8Text, key).toString();
            return encryptedMessage;
        } catch (error) {
            console.error(error)
        }
    }
    
    /**
    * @description funzione usata per leggere dal db lo status dell'utente che rappresenta la chat; in questo modo posso gestire correttamente
    * il component UI che viene settato col valore di questa funzione.
    * @param {*} uid usato come chiave per selezionare l'utente corretto nel db
    * @returns status (boolean)
    */
    const retrieveDestStatus = async (uid) => {
        const q = query (collection(db, "users"), where("uid", "==", uid));          
        let status = false;

        try {
            const querySnapshot = await getDocs(q);
                
            querySnapshot.forEach((doc) => {
                status = doc.data().isOnline;
            });
        } catch (error) {
            console.log(error)
            status = false;
        }
        return status;
    };

    /**
     * @description funzione principale del component, usata per gestire l'invio del messaggio da app a db.
     * per prima cosa viene controllato che test non sia vuoto (per gesire l'evento di invio di possibili messaggi vuoti),
     * poi viene verificato che i dati della chat esistano, e quindi che anche la chiave di sessione esista e non sia null (altrimenti non sarebbe possibile assicurare la cifratura).
     * nel caso in cui la chiave di sessione non esista o uno dei due sia offline, la conversazione non va avanti e viene displayato un alert di notifica.
     * se invece tutto va bene, quindi chiave OK e i due entrambi ONLINE, viene per prima cosa calcolato il ciphertext @encryptedMessage
     * poi viene inviato al db nelle collezioni chats e userChats(in entrambi gli utenti)
     */
    const handleSend = async () => {
        if(text === ""){
            console.log("messaggio non valido");
        } else {
            try {
                if(data && data.chatId && data.sessionKey) {
                    SESSION_KEY = await data.sessionKey;
                    status = await retrieveDestStatus(data.user.uid)
                        
                    if(SESSION_KEY === undefined || !status) {
                        alert("l'utente al momento è offline, non è possibile comunicare");
                        setText("")
                    } else { 
                        try {
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
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
            } catch (error) {
                alert("Crea una chat per iniziare!");
                setText("");
            }
        }
    };
        
    return (
        <div className="input">
            <div className="inputType">
                <MDBInput 
                    className="inputText" 
                    label='Type something...' 
                    id='formName' 
                    type='text' 
                    size="sm" 
                    onKeyDown={handleKey} 
                    value={text} onChange={(e) => setText(e.target.value)} 
                    style={{backgroundColor:'white'}}
                />
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