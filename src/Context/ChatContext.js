import {
    createContext,
    useContext,
    useReducer,
} from "react";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import sodium from "libsodium-wrappers";
import { AuthContext } from "../Context/AuthContext";


export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {

    const { currentUser, privateKey } = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        sessionKey: "null",
    };

    //log verdi
    const retrievePublicKey = async (user) => {
        const q = query(
            collection(db, "users"),
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        let pubKdest = null;

        try {
            querySnapshot.forEach((doc) => {
                pubKdest = doc.data().publicKey;
                console.log("%cpublic key dest: "+ pubKdest, 'color: green');
            });
        } catch (error) {
            console.error("utente non disponibile al momento");
            pubKdest = "";
        }
        return pubKdest;
    };


    const calculateSessionKey = async (user) => {
        try {
            //ottenimento publicK dest e privateK mitt
            //x ottenere publicK richiamo la funzione @retrievePublicKey che legge dal db
            const DEST_PUBLIC_KEY = await retrievePublicKey(user);
            const MITT_PRIVATE_KEY = privateKey;
            //console.log("%cprivate key mitt: " + MITT_PRIVATE_KEY, 'color: blue');

            //x permettere il calcolo della chiave di sessione riporto le chiavi al loro stato originale 
            //tramite funzione di libreria from_hex
            const mittPrivateKeyTOBytes = sodium.from_hex(MITT_PRIVATE_KEY);
            const destPublicKeyTOBytes = sodium.from_hex(DEST_PUBLIC_KEY);

            //calcolo SessionK usando il metodo crypto_scalarmult che prende in input le due chiavi in bytes calcolate prima
            //e restituisce la chiave di sessione in bytes
            const keySessionBYTES = sodium.crypto_scalarmult(mittPrivateKeyTOBytes, destPublicKeyTOBytes);
            //console.log(keySessionBYTES);

            //infine vado a portare la chiave da bytes in hex
            const SESSION_KEY = sodium.to_hex(keySessionBYTES);
        console.log("CHIAVE SIMMETRICA DI SESSIONE: "+ SESSION_KEY);
        } catch (error) {
            console.error("l'utente selezionato non è disponibile al momento");
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