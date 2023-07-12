import React, { useContext } from "react";
import { MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../Context/ChatContext";

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