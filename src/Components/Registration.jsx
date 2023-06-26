import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
    MDBContainer,
    MDBCol,
    MDBRow,
    MDBBtn,
    MDBInput,
    MDBValidation,
    MDBValidationItem,
    MDBCard,
    MDBCardBody,
    MDBIcon
} from 'mdb-react-ui-kit';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

import image from '../Assets/Data_security_26.jpg';
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



    /**
     * DOC
     * funzione usata per generare un numero casuale tra 10000 e 99999 che verrà usato per la creazione dell'unique tag
     * @param {*} min settato poi a 10000
     * @param {*} max settato a 99999
     * @returns numero casuale tra min e max
     */
    function randomNumberInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * DOC
     * const usata per gestire il sign up dello user, oltre i dati inseriti dallo user crea il suo unique tag
     * poi viene richiamata la funz @writeUserData per salvare il tutto sul db
     * @param {*} e usato come error trigger
     */
    const handleSignUp = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            //create user authentication
            const res = await createUserWithEmailAndPassword(auth, email, password);

            //create unique image name
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
                        });
                        //create empty chats on firestone
                        await setDoc(doc(db, "userChats", res.user.uid), {});
                        navigate('/account'); 
                    } catch (error) {
                        console.log(error);
                        setError(true);
                        setLoading(false);
                    }
                });
            });
        } catch (error) {
            setError(true);
            setLoading(false);
        }
    };

    return (
        <MDBContainer fluid className="p-3 my-5">
            <MDBRow>
                <MDBCol col='10' md='6'>
                    <img src={image} className="img-fluid" alt="Phone image" />
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

                                <p style={{marginTop:"30px"}}>Already have an account?<Link to="/Login">  Log in</Link></p>
                                <MDBBtn disabled={loading} className="mb-4 w-100" size="lg">Sign up</MDBBtn>
                                {loading && "Uploading and compressing the image please wait..."}
                                {error && <span>Something went wrong</span>}
                            </form>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    )
}

export default Registration;