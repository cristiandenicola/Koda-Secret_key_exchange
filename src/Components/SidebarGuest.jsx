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
            <Chats/>
        </div>
    );
};

export default SidebarGuest;