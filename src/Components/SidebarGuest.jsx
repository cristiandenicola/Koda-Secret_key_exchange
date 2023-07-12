import React from "react";
import NavbarAccount from "./NavbarGuest";
import Search from "./SearchGuest";
import Chats from "./ChatsGuest";
import { MDBBtn } from 'mdb-react-ui-kit';
import '../style.css'

const SidebarGuest = () => {
    return (
        <div className="sidebar" style={{backgroundColor:'#5c5555'}}>
            <NavbarAccount/>
            <Search/>
            <div className="roomsBtn" style={{justifyContent:'center'}}>
                <MDBBtn rounded type="button" className="btn btn-primary btn-sm" color='light' rippleColor='dark' style={{}}>Join a room</MDBBtn>
            </div>
            <Chats/>
        </div>
    );
};

export default SidebarGuest;