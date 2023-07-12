import React, { useContext } from "react";
import { MDBBtn } from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { doc, setDoc, deleteDoc, query, collection, getDocs } from "firebase/firestore";

const NavbarGuest = () => {
    const { currentUser } = useContext(AuthContext);

    async function deleteGuestData(uid) {
        const q = query(
            collection(db, "users"),
        );

        try {
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

            await deleteDoc(doc(db, "users", uid));
        } catch(error) {
            console.error(error)
        }
    };

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
    };

    const Logout = async ()  => {
        try {
            await deleteMessages(currentUser.uid);
            await deleteGuestData(currentUser.uid);

            localStorage.clear();
            window.location.reload(true);
            return signOut(auth)
            
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='navbar' style={{backgroundColor:'#474242'}}>
            <div className="user">
                <img className="profilePic" src="https://3.bp.blogspot.com/-UI5bnoLTRAE/VuU18_s6bRI/AAAAAAAADGA/uafLtb4ICCEK8iO3NOh1C_Clh86GajUkw/s320/guest.png" alt="" style={{marginTop:'3px'}}/>
                <span style={{marginTop:'2px'}}>Guest account</span>
                <MDBBtn rounded size="sm" color='transparent' onClick={() => Logout()} 
                    style={{
                        position:'absolute', 
                        right:'5px', 
                        background:'transparent', 
                        color:'#ddddf7'
                    }}
                >
                    Log out
                </MDBBtn>
            </div>
        </div>
    )
}

export default NavbarGuest;