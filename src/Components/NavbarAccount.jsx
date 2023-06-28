import React, { useContext } from "react";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";

const NavbarAccount = () => {
    const { currentUser } = useContext(AuthContext);


    const Logout = async ()  => {
        try {
            await updateDoc(doc(db, "users", currentUser.uid), { 
                publicKey: "",
            });
            localStorage.clear();
        } catch (error) {
            console.error(error);
        }
        window.location.reload(true);
        return signOut(auth);  
    }

    return (
        <div className='navbar'>
            <span className="logoAcc">KODA</span>
            <div className="user">
                <img className="profilePic" src={currentUser.photoURL} alt="" style={{marginTop:'3px'}}/>
                <span style={{marginTop:'2px'}}>{currentUser.displayName}</span>
                <MDBBtn rounded size="sm" color='light' rippleColor='dark' onClick={() => Logout()}>Log out</MDBBtn>
            </div>
        </div>
    )
}

export default NavbarAccount;