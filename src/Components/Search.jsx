import React, { useContext, useEffect, useState } from "react";
import { MDBInput } from 'mdb-react-ui-kit';
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

/**
 * @description component inglobato all'interno di sidebar, si occupa della ricerca di uno user cercato.
 * viene fatta una ricerca iterativa per lettera all'interno della collezione users nel db
 * @param username contiene la stringa cercata dall'utente, quindi il val che verrà confrontato nel db
 * @param user contenitore per il risultato della ricerca
 * @param error usato per il validation
 * @param currentUser const che tiene traccia dell'utente in sessione, cosi da avere un indice per le ricerche nel db
 * @returns 
 */
const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [error, setError] = useState(false);
    const { currentUser } = useContext(AuthContext);

    /**
     * @description useEffect in cui avviene la ricerca vera e propria
     * per prima cosa viene verificato che l'utente non abbia inserito una stringa vuota, poi viene confrontato il valore inserito dall'utente con quelli presenti nel db
     * ottenuta la query setto user con ciò ottenuto dalla ricerca e nel caso in cui fosse 0 setto error true 
     */
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
                    if(foundUsers.length === 0) { setError(true) }
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

    /**
     * @description funzione che gestisce l'evento click sul risultato della ricerca
     * in particolare per prima cosa viene creato un UID univoco formato dai due utenti in questione (utente che fa ricerca + ricercato)
     * per prima cosa poi verifico che il ricercato sia online, se off viene displayato un messaggio che indica che la conversazione non può iniziare
     * nel caso in cui entrambi siano online allora creo il documento chats (dove verranno salvati i ciphertexts) e aggiorno gli userChats di entrambi
     */
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
                <MDBInput wrapperClass='mb-4' label='Find a user...' value={username} onChange={(e) => setUsername(e.target.value)} id='formName' type='text' size="sm" 
                    style={{
                        color:'black', 
                        backgroundColor:'white',  
                        marginBottom:'-10px'
                    }}
                />
            </div>
            {error && <span style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#ddddf7', fontSize:'11px'}}>User not found!</span>}
            {user && ( 
                <div className="userChat" onClick={handleSelect} style={{position:'relative'}}>
                    <img className="userChatImg" src={user.photoURL} alt=""/>
                    {user.isOnline ? <div className="divOnline"></div> : <div className="divOffline" style={{backgroundColor:'gray'}}></div>}
                    <div className="userChatInfo">
                        <span className="spanName">{user.displayName}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;