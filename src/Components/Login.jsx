import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
    MDBContainer,
    MDBCol,
    MDBRow,
    MDBBtn,
    MDBIcon,
    MDBInput,
    MDBCheckbox,
    MDBCard,
    MDBCardBody
} from 'mdb-react-ui-kit';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import image from '../Assets/Data_security_26.jpg';
import ValidationLogin from "../ValidationLogin";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import NavbarAccount from "./NavbarAccount";
import { AuthContext } from "../Context/AuthContext";
import sodium from "libsodium-wrappers";


const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    let PUBLIC_KEY;
    let SECRET_KEY;


    /**
     * metodo usato x la generazione della keyPair
     * in particolare viene usato l'algoritmo X25519 che usa la curva Curve25519 (ellittico).
     * @returns coppia di key public e private
     */
    const generateUserKeys = () => {
        const USER_KEYS = sodium.crypto_kx_keypair();
        //usando crypto_kx ottengo una coppia di key basate sull'algoritmo X25519 che usa la curva Curve25519

        //console.log("chiave pub: " + USER_KEYS.publicKey);
        //console.log("chiave seg: " + USER_KEYS.privateKey);

        const PUBLIC_KEY = sodium.to_hex(USER_KEYS.publicKey);
        const SECRET_KEY = sodium.to_hex(USER_KEYS.privateKey)

        return { PUBLIC_KEY, SECRET_KEY};
    };

    async function generateUserChats(user) {
        //create empty chats on firestone
        await setDoc(doc(db, "userChats", user.uid), {});
    }
    /**
     * metodo usato per salvare la public key generata nel database
     * per permettere poi in fase di selezione chat di generare la chiave simmetrica.
     * @param {*} PUBLIC_KEY public key da salvare
     * @param {*} user utente legato a tale chiave
     */
    const saveUserPK = (PUBLIC_KEY, user) => {
        try {
            updateDoc(doc(db, "users", user.uid), { 
                publicKey: PUBLIC_KEY,
            });
        } catch (error) {
            console.error(error);
        };
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            await generateUserChats(auth.currentUser);
            navigate('/account');
            
            const keys = generateUserKeys();
            PUBLIC_KEY = keys.PUBLIC_KEY;
            SECRET_KEY = keys.SECRET_KEY;

            //salvo la chiave segreta all'interno del local storage in modo da poterla usare per tutta la sessione
            localStorage.setItem('secretKey', SECRET_KEY); 

            //salvo la public key nel database (volendo posso salvarla anche lei nel local storage invece che nel db)
            saveUserPK(PUBLIC_KEY, auth.currentUser)

        } catch (error) {
            setError(true);
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
                            <form onSubmit={handleSignIn}>
                                <MDBInput wrapperClass='mb-4' label='Email address' id='formEmail' required type='email' size="lg" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                {error.email && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.email}</p>}
                                <MDBInput wrapperClass='mb-4' label='Password' autoComplete="on" id='formPassword' required type='password' size="lg" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                {error.password && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.password}</p>}
                                <div className="d-flex justify-content-between mx-4 mb-4">
                                    <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                                    <p>No account?<Link to="/Registration">  Create one</Link></p>
                                </div>

                                <MDBBtn className="mb-4 w-100" size="lg">Sign in</MDBBtn>
                                {error && <span>Something went wrong</span>}

                                <div className="divider flex align-items-center my-4">
                                    <p className="text-center fw-bold mx-3 mb-0">OR</p>
                                </div>

                                <MDBBtn className="ms-2 w-100" size="lg" style={{backgroundColor: '#dd4b39'}}>
                                    <MDBIcon fab icon='google ' className="mx-2"/>
                                        Continue with Google
                                </MDBBtn>
                            </form>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    )
}

export default Login;