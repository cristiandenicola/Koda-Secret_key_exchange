import React, { useContext } from "react";
import {
    MDBIcon,
    MDBBtn
} from 'mdb-react-ui-kit';
import Messages from "./MessagesGuest";
import Input from "./InputGuest";
import { ChatContext } from "../Context/ChatContext";

const ChatGuest = () => {
    const { data } = useContext(ChatContext);

    return (
        <div className="chat">
            <div className="chatInfo" style={{backgroundColor:'#8c7d7d'}}>
                <div className="divInfo">
                    {data.user?.photoURL && <img className="chatInfoPic" src={data.user.photoURL} alt="" style={{backgroundColor:'#8c7d7d'}}/>}
                    <span className="chatInfoName">{data.user?.displayName}</span>
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

export default ChatGuest;