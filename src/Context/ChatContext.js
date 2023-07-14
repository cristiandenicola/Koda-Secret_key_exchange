import { createContext, useContext, useReducer } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import sodium from "libsodium-wrappers";
import { AuthContext } from "../Context/AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {

    const { currentUser } = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        sessionKey: "null",
        selectedUser: false,
    };

    const retrievePublicKey = async (user) => {
        const q = query(
            collection(db, "users"),
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        let publicKeyDest = null;

        try {
            querySnapshot.forEach((doc) => {
                publicKeyDest = doc.data().publicKey;
            });
        } catch (error) {
            console.error("utente offline");
            publicKeyDest = "";
        }
        return publicKeyDest;
    };

    const calculateSessionKey = async (user) => {
        try {
            const DEST_PUBLIC_KEY = await retrievePublicKey(user);
            const MITT_PRIVATE_KEY = localStorage.getItem('secretKey');

            if(DEST_PUBLIC_KEY !== "" || DEST_PUBLIC_KEY != undefined) {
                const mittPrivateKeyTOBytes = sodium.from_hex(MITT_PRIVATE_KEY);
                const destPublicKeyTOBytes = sodium.from_hex(DEST_PUBLIC_KEY);
                
                const keySessionBYTES = sodium.crypto_scalarmult(mittPrivateKeyTOBytes, destPublicKeyTOBytes);
                const SESSION_KEY = sodium.to_hex(keySessionBYTES);

                return SESSION_KEY;
            }else {
                alert("l'utente al momento è offline, non è possibile comunicare");
            }
        } catch (error) {
            alert("l'utente selezionato non è disponibile al momento");
        }
    };

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    user: action.payload,
                    chatId:
                        currentUser.uid > action.payload.uid
                            ? currentUser.uid + action.payload.uid
                            : action.payload.uid + currentUser.uid,
                    sessionKey: calculateSessionKey(action.payload),
                    selectedUser: true,
                };
                
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <ChatContext.Provider value={{ data:state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};