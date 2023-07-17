import React, { useContext } from "react";
import { MDBBtn } from 'mdb-react-ui-kit';
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
import { doc, updateDoc, setDoc, deleteDoc, query, collection, getDocs } from "firebase/firestore";

/**
 * @description Component inglobato da sidebar, i metodi presenti sono per gestire il logout, per il resto è UI
 * @param currentUser const che tiene traccia dell'utente in sessione, cosi da avere un indice per le ricerche nel db
 * @returns 
 */
const NavbarAccount = () => {
    const { currentUser } = useContext(AuthContext);

    /**
     * @description funzione di gestione logout.
     * in questo caso questa funzione viene richiamata in logout per aggiornare e quindi resettare la publicKey dello user (ricordo che le coppie di chiavi sono effimere).
     * @param {*} user utente in questione
     */
    async function resetPublicKey(user) {
        try {
            await updateDoc(doc(db, "users", user.uid), { 
                publicKey: "",
            });
        } catch(error) {
            console.error(error)
        }
    };

    /**
     * @description funzione di gestione logout.
     * in questo caso questa funzione viene richiamata in logout per aggiornare lo status dell'utente, quindi passare da online ad offline.
     * @param {*} user utente in questione
     */
    async function updateStatus(user) {
        try {
            updateDoc(doc(db, "users", user.uid), { 
                isOnline: false,
            });
        } catch (error) {
            console.error(error);
        };
    };

    /**
     * @description funzione di gestione logout.
     * in questo caso questa funzione viene richiamata in logout per eliminare ogni traccia della/e conversazione/i e rendere il tutto il più effimero possibile
     * per prima cosa vengono eliminate le userChats, poi si passa alla collezione chats dove viene controllato se nella PK è contenuto l'uid dell'utente in questione e se si viene eliminato 
     * @param {*} user utente in questione
     */
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

    /**
     * @description Metodo principale di logout, in questo metodo vengono richiamate tutte le funzioni viste in precedenza
     * poi viene fatto il clear del localStorage e infine il logout vero e proprio.
     * @returns 
     */
    const Logout = async ()  => {
        try {
            await resetPublicKey(currentUser);
            await updateStatus(currentUser);
            await deleteMessages(currentUser.uid);

            localStorage.clear();
            window.location.reload(true);
            return signOut(auth)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='navbar'>
            <div className="user">
                <img className="profilePic" src={currentUser.photoURL} alt="" style={{marginTop:'3px'}}/>
                <span style={{marginTop:'2px'}}>{currentUser.displayName}</span>
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
    );
}

export default NavbarAccount;