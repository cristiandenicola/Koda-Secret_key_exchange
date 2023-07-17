import React, { useContext } from "react";
import { MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../Context/ChatContext";

/**
 * @description Assieme a sidebar è uno dei due macro component che formano Account;
 * Ha il compito di gestire la comunicazione tra i due utenti fornendo una UI
 * è sviluppata implementando due components: Messages, component usato per gestire i messaggi sia in front che in back
 * e Input, component usato per gestire l'invio del messaggio e la sua cifratura.
 * @param data param preso dal ChatContext in cui risiedono dati essenziati dell'altro utente e della sessione della chat
 * @param photoURL param che contiene l'url dell'immagine dell'altro utente per caricarla dentro alla chat
 * @param displayName param che contiene il nome dell'altro utente per caricarlo dentro la chat.
 * @returns 
 */
const Chat = () => {
    const { data } = useContext(ChatContext);
    const { photoURL, displayName } = data.user || {};

    return (
        <div className="chat">
            <div className="chatInfo">
                <div className="divInfo">
                    {photoURL && <img className="chatInfoPic" src={photoURL} alt="" />}
                    {displayName && <span className="chatInfoName">{displayName}</span>}
                </div>
                <div className="chatIcons">
                    <MDBBtn rounded size="sm" color='light' rippleColor='dark'>
                        <MDBIcon fas icon='lock' />
                    </MDBBtn>
                    <MDBBtn rounded size="sm" color='light' rippleColor='dark'>
                        <MDBIcon fas icon='hands-helping' />
                    </MDBBtn>
                    <MDBBtn rounded size="sm" color='light' rippleColor='dark'>
                        <MDBIcon fas icon='ellipsis-h' />
                    </MDBBtn>
                </div>
            </div>
            <Messages/>
            <Input/>
        </div>
    );
};

export default Chat;