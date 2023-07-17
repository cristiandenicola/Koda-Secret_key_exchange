import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc, setDoc, deleteDoc, query, collection, getDocs } from "firebase/firestore";

export const AuthContext = createContext();

/**
 * @description context principale per la gestione dell'auth, quindi che tiene traccia dell'utente in sessione
 * @param currentUser paramentro in cui viene inserito l'utente in sessione e che verrà poi passato a tutto il codice
 * @param {*} param0 
 * @returns 
 */
export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({});
    
    /**
     * @description useEffect in cui per prima cosa viene settato l'utente che è entrato in sessione
     * poi viene gestita il sessionTimeOut in modo che dopo 2 ore di inattività venga eseguito automaticamente il logout e la rimozione delle info
     */
    useEffect(() => {
        const sessionTimeout = 2 * 60 * 60 * 1000;
        let logoutTimer;

        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

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
        }
    
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
        }
    
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
        }

        /**
         * @description Metodo principale di logout, in questo metodo vengono richiamate tutte le funzioni viste in precedenza
         * poi viene fatto il clear del localStorage, viene rimosso l'eventListener e infine il logout vero e proprio.
         * @returns 
         */
        const logout = async () => {
            try {
                await resetPublicKey(currentUser);
                await updateStatus(currentUser);
                await deleteMessages(currentUser.uid);

                localStorage.clear();

                window.location.reload(true);
                removeEventListeners();
                return signOut(auth);
            } catch (error) {
                console.error(error);
            }
        };
        
        /**
         * @description funzione che va a resettare il timeout in quanto è stata eseguita un azione che ha provato che l'utente è attivo
         */
        const resetLogoutTimer = () => {
            clearTimeout(logoutTimer);
            logoutTimer = setTimeout(logout, sessionTimeout);
        };

        /**
         * @description funzione che contiene i listeners per la verifica dell'attività da parte dell'utente
         * nel momento in cui uno dei listeners si attiva viene resettato il timer
         */
        const addEventListeners = () => {
            window.addEventListener("mousemove", resetLogoutTimer);
            window.addEventListener("keydown", resetLogoutTimer);
        };

        /**
         * funzione che viene eseguita nel momento del logout, i listeners vengono disabilitati in quanto la sessione è stata chiusa direttamente dall'utente
         */
        const removeEventListeners = () => {
            window.removeEventListener("mousemove", resetLogoutTimer);
            window.removeEventListener("keydown", resetLogoutTimer);
        };

        if (currentUser) {
            logoutTimer = setTimeout(logout, sessionTimeout);
            addEventListeners();
        };

        return () => {
            unsub();
            clearTimeout(logoutTimer);
            removeEventListeners()
        };
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

