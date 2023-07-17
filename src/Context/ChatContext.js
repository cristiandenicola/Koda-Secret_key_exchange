import { createContext, useContext, useReducer } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import sodium from "libsodium-wrappers";
import { AuthContext } from "../Context/AuthContext";

export const ChatContext = createContext();
/**
 * @description context principale per la gestione della chat, quindi che tiene traccia dei dati della chat e dai loro proprietari
 * @param currentUser paramentro in cui viene inserito l'utente in sessione e che verrà poi passato a tutto il codice
 * @param INITIAL_STATE contiene le informazioni principali della chat, quali: chatID, gli user che la compongono, la sessionKey
 * @param {*} param0 
 * @returns 
 */
export const ChatContextProvider = ({ children }) => {

    const { currentUser } = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        sessionKey: "null",
        selectedUser: false,
    };

    /**
     * @description metodo usato per il recupero della publicKey dell'utente cercato da quello in sessione 
     * @param {*} user 
     * @returns publicKeyDest
     */
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

    /**
     * @description metodo usato per calcolare localmente la chiave di sessione che verrà usata per cifrare i messaggi scambiati tra i due utenti
     * per prima cosa viene recuperata la chiave pubblica dell'altro utente dal db con il metodo @retrievePublicKey
     * poi le chiavi vengono convertite in bytes e date in pasto alla funzione di calcolo che restituirà la chiave di sessione simmetrica da entrambe le parti
     * @param {*} user 
     * @returns SESSION_KEY
     */
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

    /**
     * @description metodo reducer quindi usato per settare un nuovo stato; in questo caso è usato per passare da una chat all'altra nel component chats
     * @param {*} state 
     * @param {*} action 
     * @returns 
     */
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