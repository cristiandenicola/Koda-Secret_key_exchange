import React from "react";
import NavbarAccount from "./NavbarAccount";
import Search from "./Search";
import Chats from "./Chats";
import { MDBBtn } from 'mdb-react-ui-kit';
import '../style.css'

const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavbarAccount/>
            <Search/>
            <div className="roomsBtn">
                <MDBBtn rounded type="button" className="btn btn-primary btn-sm" color='light' rippleColor='dark' >Create a room</MDBBtn>
                <MDBBtn rounded type="button" className="btn btn-primary btn-sm" color='light' rippleColor='dark' >Join a room</MDBBtn>
            </div>
            <Chats/>
        </div>
    );
};

export default Sidebar;