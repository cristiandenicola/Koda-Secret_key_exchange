import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MDBContainer,
    MDBCol,
    MDBRow,
    MDBBtn,
    MDBInput,
    MDBCard,
    MDBCardBody,
    MDBIcon
} from 'mdb-react-ui-kit';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage, db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import sodium from "libsodium-wrappers";

import image from '../Assets/cover.png';
import Add from "../Assets/addAvatar.png";
import Validation from "../Validation";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";

/**
 * @description metodo usato per la gestione della registrazione da parte di un nuovo user.
 * si interfaccia con il db per il salvataggio e la creazione di una nuova utenza.
 * @param displayName valore preso dal nome inserito dallo user
 * @param email valore preso dalla mail inserita dallo user
 * @param password valore preso dalla password inserita dallo user
 * @param avatar avatar scelto dall'utente (salvato nello storage firebase)
 * @param error usato per il validation
 * @param PUBLIC_KEY valore della public key calcolata
 * @param SECRET_KEY valore della private key calcolata
 * @returns 
 */
const Registration = () => {
    
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    
    let PUBLIC_KEY;
    let SECRET_KEY;
    
    /**
     * @description funzione usata per calcolare la coppia di chiavi pubblica-privata con diffie hellman.
     * viene usata la libreria https://github.com/jedisct1/libsodium.js e le chiavi vengono calcolate sulla base dell'algoritmo X25519 che usa la curva Curve25519
     * @returns PUBLIC_KEY, SECRET_KEY
     */
    const generateUserKeys = () => {
        const USER_KEYS = sodium.crypto_kx_keypair();
        
        const PUBLIC_KEY = sodium.to_hex(USER_KEYS.publicKey);
        const SECRET_KEY = sodium.to_hex(USER_KEYS.privateKey)
        
        return { PUBLIC_KEY, SECRET_KEY};
    };
    
    /**
     * @description metodo principale del component usato per la gestione della registrazione di un nuovo user.
     * per prima cosa viene salvata l'immagine (avatar) nello storage di firebase e gli viene calcolata una PK con il nome dell'utente + data
     * poi viene creata l'utenza nel db di questo utente salvando i dati inseriti nel form di registrazione
     * infine, viene richiamato il metodo @generateUserKeys e salvata la publicKey all'interno del db 
     * @param {*} e 
     */
    const handleSignUp = async (e) => {
        try {
            if(avatar === '') {
                alert("Inserisci un avatar")
            } else {
                e.preventDefault();
                const res = await createUserWithEmailAndPassword(auth, email, password);
                
                const date = new Date().getTime();
                const storageRef = ref(storage, `${displayName + date}`);
                
                await uploadBytesResumable(storageRef, avatar).then(() => {
                    getDownloadURL(storageRef).then(async (getDownloadURL) => {
                        try {
                            await updateProfile(res.user, {
                                displayName,
                                photoURL: getDownloadURL,
                            });
                            
                            await setDoc(doc(db, "users", res.user.uid), {
                                uid: res.user.uid,
                                displayName,
                                email,
                                photoURL: getDownloadURL,
                                publicKey: "",
                                isOnline: true,
                            });
                            await setDoc(doc(db, "userChats", res.user.uid), {});
                            navigate('/account'); 
                            
                            const keys = generateUserKeys();
                            PUBLIC_KEY = keys.PUBLIC_KEY;
                            SECRET_KEY = keys.SECRET_KEY;
                            localStorage.setItem('secretKey', SECRET_KEY);
                            
                            updateDoc(doc(db, "users", res.user.uid), { 
                                publicKey: PUBLIC_KEY,
                            });
                            
                        } catch (error) {
                            console.log(error);
                            setError(true);
                        }
                    });
                });
            }
        } catch (error) {
            setError(true);
        }
    };
    
    return (
        <MDBContainer fluid className="p-3 my-5">
            <MDBRow>
                <MDBCol col='10' md='6' style={{maxWidth:'100%'}}>
                    <img src={image} className="img-fluid" alt="Phone image" style={{width:'90%', marginLeft:'20px', objectFit:'cover'}}/>
                </MDBCol>
                <MDBCol col='4' md='5'>
                    <MDBCard className='bg-white' style={{borderRadius: '1rem', maxWidth: 'auto'}}>
                        <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                            <form onSubmit={handleSignUp}>
                                <MDBInput wrapperClass='mb-4' label='Full name' id='formName' required type='text' size="lg" value={displayName} onChange={(e) => setDisplayName(e.target.value)}/>
                                {error.name && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.name}</p>}
                                <MDBInput wrapperClass='mb-4' label='Email address' id='formEmail' required type='email' size="lg" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                {error.email && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.email}</p>}
                                <MDBInput wrapperClass='mb-4' label='Password' autoComplete="on" id='formPassword' required type='password' size="lg" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                {error.password && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.password}</p>}
                                
                                <input style={{display:"none"}} type="file" id="file" onChange={(e) => setAvatar(e.target.files[0])}/>
                                <label htmlFor="file" className="labelAvatar">
                                    <img className="imgAvatar" src={Add} alt="" style={{width: "32px"}}/>
                                    <span>Add an avatar</span>
                                </label>
                                
                                <p style={{marginTop:"30px"}}>Already have an account?<Link to="/" style={{color:'#91b3fa'}}>  Log in</Link></p>
                                <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor:'#91b3fa', color:'black'}}>
                                    <MDBIcon icon='user-plus ' className="mx-2"/>
                                    Sign up
                                </MDBBtn>
                                {error && <span>Something went wrong</span>}
                            </form>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}

export default Registration;