import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

/**
 * @description Component che rappresenta il vero e proprio messaggio visualizzato.
 * @param currentUser const che tiene traccia dell'utente in sessione, cosi da avere un indice per le ricerche nel db
 * @param showPassword const boolean usata per gestire il toggle del messaggio nel caso fosse di tipo /hide
 * @param data param preso dal ChatContext in cui risiedono dati essenziati dell'altro utente e della sessione della chat
 * @returns 
 */
const Message = ({ message }) => {

    const { currentUser } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const { data } = useContext(ChatContext);
    const ref = useRef();

    /**
     * @description metodo usato per gestire il toggle del component message nel caso in cui il messaggio fosse di tipo /hide
     */
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    /**
     * @description useEffect usato per aggiungere un effetto alla visualizzazione dei messaggi.
     * nel caso in cui arriva un nuovo messaggio e io sono sopra l'effetto mi riporta al nuovo messaggio
     */
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className="messageInfo">
                <img 
                    className="mexChatImg"
                    style={{backgroundColor:'transparent'}} 
                    src={
                        message.senderId === currentUser.uid
                            ? currentUser.photoURL
                            : data.user.photoURL
                    } 
                    alt=""
                />
                <span style={{fontSize:'11px', padding:'5px', marginLeft:'3px'}}>
                    {message.date.toDate().getHours().toString().padStart(2, "0")}:
                    {message.date.toDate().getMinutes().toString().padStart(2, "0")}
                </span>
            </div>
            <div className="messageContent">
                {message.text.includes("/hide") ? (
                    <div>
                        <input className="mexBox" 
                            type={showPassword ? 'text' : 'password'} 
                            style={{border:'none', outline:'none', padding:'10px'}}
                            value={message.text.replace('/hide', '')} 
                            readOnly
                        />
                        {showPassword ? (
                            <FaEyeSlash onClick={togglePasswordVisibility} style={{marginLeft:'10px'}}/>
                        ) : (
                            <FaEye onClick={togglePasswordVisibility} style={{marginLeft:'10px'}}/>
                        )}
                    </div>
                ) : (
                    <p className="mexBox">{message.text}</p>
                )}
            </div>
        </div>
    );
};

export default Message;