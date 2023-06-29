import React, { useContext, useState } from "react";
import {
    MDBInput
} from 'mdb-react-ui-kit';
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
import { AuthContext } from "../Context/AuthContext";


const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [error, setError] = useState(false);

    const { currentUser } = useContext(AuthContext);

    const handleSearch = async () => {
        const q = query(
            collection(db, "users"),
            where("displayName", "==", username)
        );

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUser(doc.data());
            });
        } catch (error) {
            setError(true);
        }
    };

    const handleKey = (e) => {
        e.code === "Enter" && handleSearch();
    };

    const handleSelect = async () => {
        const combinedId =
            currentUser.uid > user.uid
                ? currentUser.uid + user.uid
                : user.uid + currentUser.uid;
        try {
            const res = await getDoc(doc(db, "chats", combinedId));
    
            if (!res.exists()) {
                //create a chat in chats collection
                await setDoc(doc(db, "chats", combinedId), { messages: [], users: combinedId });
        
                //create user chats
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [combinedId + ".userInfo"]: {
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    },
                    [combinedId + ".date"]: serverTimestamp(),
                });
        
                await updateDoc(doc(db, "userChats", user.uid), {
                    [combinedId + ".userInfo"]: {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                    },
                    [combinedId + ".date"]: serverTimestamp(),
                });
            }
        } catch (error) {}
    
        setUser(null);
        setUsername("")
    };

    return (
        <div className="search">
            <div className="searchForm">
            <MDBInput wrapperClass='mb-4' label='Find a user...' onKeyDown={handleKey} value={username} onChange={(e) => setUsername(e.target.value)} id='formName' type='text' size="sm" style={{color:'black', backgroundColor:'white', marginBottom:'-10px'}}/>
            </div>
            {error && <span>User not found!</span>}
            {user && ( 
                <div className="userChat" onClick={handleSelect}>
                    <img className="userChatImg" src={user.photoURL} alt=""/>
                    <div className="userChatInfo">
                        <span className="spanName">{user.displayName}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;

//Capire perchè quando clicco chat sparisce ma salva su db

//QUANDO CLICCO SU RICERCA NON CREA LA STANZA !!!!!!