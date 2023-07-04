import React, { useState, useContext } from "react";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Chat from "./ChatGuest";
import Sidebar from "./SidebarGuest";

const AccountGuest = () => {

    const Logout = async ()  => {
        try {
            window.location.reload(true);
            return signOut(auth)
            
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="home">
            <Sidebar/>
            <Chat/>
        </div>
    );
}

export default AccountGuest;