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
import nacl from 'tweetnacl';
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

        querySnapshot.forEach((doc) => {
            pubKdest = doc.data().publicKey;
            console.log("%cpublic key dest: "+ pubKdest, 'color: green');
        });
        
        return pubKdest;
    };


    const calculateSessionKey = async (user) => {
        const DEST_PUBLIC_KEY = await retrievePublicKey(user);
        const MITT_PRIVATE_KEY = privateKey;
        console.log("%cprivate key mitt: " + MITT_PRIVATE_KEY, 'color: blue');

        //const mittPrivateKeyTOBytes = atob(MITT_PRIVATE_KEY);

        //console.log("%cpublic key dest in byte: " + destPublicKeyTOBytes, 'color: red');
        //console.log("%cprivate key mitt in byte: " + mittPrivateKeyTOBytes, 'color: red');

        //const keySessionBYTES = nacl.box.before(destPublicKeyTOBytes, mittPrivateKeyTOBytes);
        //const SESSION_KEY = btoa(keySessionBYTES);

        //console.log(SESSION_KEY);
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