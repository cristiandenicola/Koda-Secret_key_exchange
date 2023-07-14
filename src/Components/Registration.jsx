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



const Registration = () => {
    
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    
    let PUBLIC_KEY;
    let SECRET_KEY;
    
    
    
    const generateUserKeys = () => {
        const USER_KEYS = sodium.crypto_kx_keypair();
        //usando crypto_kx ottengo una coppia di key basate sull'algoritmo X25519 che usa la curva Curve25519
        
        const PUBLIC_KEY = sodium.to_hex(USER_KEYS.publicKey);
        const SECRET_KEY = sodium.to_hex(USER_KEYS.privateKey)
        
        return { PUBLIC_KEY, SECRET_KEY};
    };
    
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
                <MDBCol col='10' md='6'>
                    <img src={image} className="img-fluid" alt="Phone image" style={{width:'800px', height:'550px', marginLeft:'20px'}}/>
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
                                <MDBBtn disabled={loading} className="mb-4 w-100" size="lg" style={{backgroundColor:'#91b3fa', color:'black'}}>
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