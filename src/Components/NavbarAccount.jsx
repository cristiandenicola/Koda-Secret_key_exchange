import React, { useContext } from "react";
import {
    MDBBtn
} from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { doc, updateDoc, setDoc, deleteDoc, query, where, collection, getDocs } from "firebase/firestore";

const NavbarAccount = () => {
    const { currentUser } = useContext(AuthContext);

    async function resetPublicKey(user) {
        try {
            await updateDoc(doc(db, "users", user.uid), { 
                publicKey: "",
            });
        } catch(error) {
            console.error(error)
        }
    }

    async function deleteMessages(uid) {
        const q = query(
            collection(db, "chats"),
        );

        try {
            await setDoc(doc(db, "userChats", uid), {});
            await deleteDoc(doc(db, "userChats", uid));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                const CombinedUid = doc.data().users;
                if(CombinedUid?.includes(uid)) {
                    const documentRef = doc.ref;
                    await deleteDoc(documentRef);
                    console.log("Documento eliminato:", doc.id);
                }
            });
        } catch (error) {
            console.error(error)
        }
    }

    const Logout = async ()  => {
        try {
            await resetPublicKey(currentUser);
            await deleteMessages(currentUser.uid);

            localStorage.clear();
            window.location.reload(true);
            return signOut(auth)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='navbar'>
            <div className="user">
                <img className="profilePic" src={currentUser.photoURL} alt="" style={{marginTop:'3px'}}/>
                <span style={{marginTop:'2px'}}>{currentUser.displayName}</span>
                <MDBBtn rounded size="sm" color='transparent' onClick={() => Logout()} style={{position:'absolute', right:'5px', background:'transparent', color:'#ddddf7'}}>Log out</MDBBtn>
            </div>
        </div>
    )
}

export default NavbarAccount;