import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 


const MessageGuest = ({ message }) => {

    const { currentUser } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const { data } = useContext(ChatContext);
    let date;
    const ref = useRef();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "guest"}`}>
            <div className="messageInfo">
                <img 
                    className="mexChatImg"
                    style={{backgroundColor:'transparent'}}
                    src={
                        message.senderId === currentUser.uid
                            ? "https://3.bp.blogspot.com/-UI5bnoLTRAE/VuU18_s6bRI/AAAAAAAADGA/uafLtb4ICCEK8iO3NOh1C_Clh86GajUkw/s320/guest.png"
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
                            style={{border:'none', outline:'none'}}
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

export default MessageGuest;