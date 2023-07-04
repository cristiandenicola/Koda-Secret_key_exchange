import React, { useContext } from "react";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { doc, updateDoc, setDoc, deleteDoc, query, where, collection, getDocs } from "firebase/firestore";

const NavbarGuest = () => {
    const { currentUser } = useContext(AuthContext);

    const Logout = async ()  => {
        try {
            window.location.reload(true);
            return signOut(auth)
            
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='navbar'>
            <div className="user">
                <img className="profilePic" src="https://3.bp.blogspot.com/-UI5bnoLTRAE/VuU18_s6bRI/AAAAAAAADGA/uafLtb4ICCEK8iO3NOh1C_Clh86GajUkw/s320/guest.png" alt="" style={{marginTop:'3px'}}/>
                <span style={{marginTop:'2px'}}>Guest account</span>
                <MDBBtn rounded size="sm" color='transparent' onClick={() => Logout()} style={{position:'absolute', right:'5px', background:'transparent', color:'#ddddf7'}}>Log out</MDBBtn>
            </div>
        </div>
    )
}

export default NavbarGuest;