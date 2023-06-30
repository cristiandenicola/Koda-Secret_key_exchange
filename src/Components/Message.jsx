import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";


const Message = ({ message }) => {

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    let date;
    const ref = useRef();

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className="messageInfo">
                <img 
                    className="mexChatImg" 
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
                <p className="mexBox">{message.text}</p>
            </div>
        </div>
    );
};

export default Message;