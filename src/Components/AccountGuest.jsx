import React, { useState, useContext } from "react";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

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
        <div className="hero">
            <h1>GUEST ACCOUNT</h1>
            <MDBBtn rounded type="button" className="btn btn-primary btn-lg" color='light' rippleColor='dark' onClick={() => Logout()}>Log out</MDBBtn>
        </div>
    );
}

export default AccountGuest;