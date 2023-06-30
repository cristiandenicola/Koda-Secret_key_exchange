import React from "react";
import NavbarAccount from "./NavbarAccount";
import Search from "./Search";
import Chats from "./Chats";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import '../style.css'

const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavbarAccount/>
            <Search/>
            <Chats/>
            <div className="roomsBtn">
            <MDBBtn rounded type="button" className="btn btn-primary btn-lg" color='light' rippleColor='dark' style={{width:'180px'}}>Create a room</MDBBtn>
            <MDBBtn rounded type="button" className="btn btn-primary btn-lg" color='light' rippleColor='dark' style={{width:'180px'}}>Join a room</MDBBtn>
            </div>
        </div>
    );
};

export default Sidebar;