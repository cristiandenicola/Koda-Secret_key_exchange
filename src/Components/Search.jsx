import React, { useContext, useEffect, useState } from "react";
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

    useEffect(() => {
        const handleSearch = async () => {
            if (username !== "") {
                const q = query(
                    collection(db, "users"),
                    where("displayName", ">=", username),
                    where("displayName", "<=", username + '\uf8ff')
                );

                try {
                    const querySnapshot = await getDocs(q);
                    const foundUsers = querySnapshot.docs.map((doc) => doc.data());
                    setUser(foundUsers.length > 0 ? foundUsers[0] : null);
                    if(foundUsers.length === 0) {setError(true)}
                } catch (error) {
                    setError(true);
                }
            } else {
                setUser(null);
                setError(false);
            }
        };

        handleSearch();
    }, [username]);


    const handleSelect = async () => {
        const combinedId =
            currentUser.uid > user.uid
                ? currentUser.uid + user.uid
                : user.uid + currentUser.uid;
        try {
            if(user.publicKey === "") {
                alert("utente al momento offline...")
            } else {
                const res = await getDoc(doc(db, "chats", combinedId));
    
                if (!res.exists()) {
                    await setDoc(doc(db, "chats", combinedId), { messages: [], users: combinedId });
        
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
            }
        } catch (error) {}
    
        setUser(null);
        setUsername("")
    };

    return (
        <div className="search">
            <div className="searchForm">
            <div className="myChats">
                    <p className="chats">Chat</p>
                </div>
                <MDBInput wrapperClass='mb-4' label='Find a user...' value={username} onChange={(e) => setUsername(e.target.value)} id='formName' type='text' size="sm" style={{color:'black', backgroundColor:'white', marginBottom:'-10px'}}/>
            </div>
            {error && <span style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#ddddf7', fontSize:'11px'}}>User not found!</span>}
            {user && ( 
                <div className="userList">
                    <div className="userChat" onClick={handleSelect}>
                        <img className="userChatImg" src={user.photoURL} alt=""/>
                        <div className="userChatInfo">
                            <span className="spanName">{user.displayName}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;