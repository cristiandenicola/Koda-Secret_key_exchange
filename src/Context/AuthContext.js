import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import nacl from 'tweetnacl';
import { doc, updateDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({});
    const [publicKey, setPublicKey] = useState("");
    const [privateKey, setPrivateKey] = useState("");

    const saveUserPK = (PUBLIC_KEY, user) => {
        try {
            updateDoc(doc(db, "users", user.uid), { 
                publicKey: PUBLIC_KEY,
            });
        } catch (error) {
            console.error(error);
        };
    };
    
    const generateUserKeys = () => {
        const USER_KEYS = nacl.box.keyPair();
        
        //console.log("chiave pub: " + USER_KEYS.publicKey);
        //console.log("chiave seg: " + USER_KEYS.secretKey);

        const PUBLIC_KEY = btoa(USER_KEYS.publicKey);
        const SECRET_KEY = btoa(USER_KEYS.secretKey);

        //console.log("chiave pub: " + PUBLIC_KEY);
        //console.log("chiave seg: " + SECRET_KEY);

        return { PUBLIC_KEY, SECRET_KEY};
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            console.log(user);

            if(user) {
                const keys = generateUserKeys();

                setPublicKey(keys.PUBLIC_KEY);
                setPrivateKey(keys.SECRET_KEY);
                
                saveUserPK(keys.PUBLIC_KEY, user);

                console.log("%cchiave pubblica user: " + keys.PUBLIC_KEY, 'color: purple');
                console.log("%cchiave segreta user: " + keys.SECRET_KEY, 'color: purple');
            } else {
                setPublicKey(null);
                setPrivateKey(null);
            }
        });
        
        return () => {
            unsub();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, publicKey, privateKey }}>
            {children}
        </AuthContext.Provider>
    );
};

