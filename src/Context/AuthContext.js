import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc, setDoc, deleteDoc, query, where, collection, getDocs } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({});
    
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        async function resetPublicKey(user) {
            try {
                await updateDoc(doc(db, "users", user.uid), { 
                    publicKey: "",
                });
            } catch(error) {
                console.error(error)
            }
        }
    
        async function updateStatus(user) {
            try {
                updateDoc(doc(db, "users", user.uid), { 
                    isOnline: false,
                });
            } catch (error) {
                console.error(error);
            };
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

        const logout = async () => {
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
        
        const sessionTimeout = 2 * 60 * 60 * 1000; //2h timeout
        let logoutTimer;

        const resetLogoutTimer = () => {
            clearTimeout(logoutTimer);
            logoutTimer = setTimeout(logout, sessionTimeout);
        };

        const addEventListeners = () => {
            window.addEventListener("mousemove", resetLogoutTimer);
            window.addEventListener("keydown", resetLogoutTimer);
        };

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

