import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { signInAnonymously, signInWithEmailAndPassword } from "firebase/auth";
import image from '../Assets/cover.png';
import ValidationLogin from "../ValidationLogin";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import sodium from "libsodium-wrappers";

/**
 * @description Component usato per la gestiore del login da parte dell'utente
 * si interfaccia con il db per la lettura dei dati e il salvataggio della publicKey e dello status.
 * @param email valore preso dalla mail inserita dallo user
 * @param password valore preso dalla password inserita dallo user
 * @param error usato per il validation
 * @param PUBLIC_KEY valore della public key calcolata
 * @param SECRET_KEY valore della private key calcolata
 * @returns 
 */
const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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
     * @description funzione che crea la collezione userChats dell'utente.
     * questo perchè l'app è concentrata sul concetto di effimero e quindi ad ogni fine sessione (logout) vengono eliminati tutti i doc con dati sensibili per non lasciare tracce.
     * @param {*} user 
     */
    async function generateUserChats(user) {
        await setDoc(doc(db, "userChats", user.uid), {});
    };

    /**
     * @description funzione usata per salvare nel db @PUBLIC_KEY chiave pubblica dell'utente quindi non un dato sensibile
     * viene salvata li e non nel localStorage per comodità
     * @param {*} PUBLIC_KEY public key calcolata dello user
     * @param {*} user user proprietario della coppia di key
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
    
    /**
     * @description funzione usata per aggiornare lo status dell'utente al momento del login, quindi passa da offline a online (boolean)
     * @param {*} user 
     */
    const updateStatus = (user) => {
        try {
            updateDoc(doc(db, "users", user.uid), { 
                isOnline: true,
            });
        } catch (error) {
            console.error(error);
        };
    }

    /**
     * @description metodo di gestione del login GUEST, quindi usa il metodo signInAnonymously di firebase. poi viene richiamato  @generateUserChats per generare il doc di userChats dell'account.
     * in seguito vengono salvate le info di questo utente GUEST su un utenza temporanea (a fine sessione verrà eliminata) con nome e immagine default.
     * in fine viene richimato il metodo @generateUserKeys per la generazione della coppia di key di sessione
     * @param {*} e 
     */
    const handleGuestSignIn = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signInAnonymously(auth);
            await generateUserChats(auth.currentUser);

            await setDoc(doc(db, "users", auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                displayName: "Guest",
                photoURL: "https://3.bp.blogspot.com/-UI5bnoLTRAE/VuU18_s6bRI/AAAAAAAADGA/uafLtb4ICCEK8iO3NOh1C_Clh86GajUkw/s320/guest.png",
                publicKey: "",
            });

            await setDoc(doc(db, "userChats", auth.currentUser.uid), {});
            navigate('/guest');

            const keys = generateUserKeys();
            PUBLIC_KEY = keys.PUBLIC_KEY;
            SECRET_KEY = keys.SECRET_KEY;

            localStorage.setItem('secretKey', SECRET_KEY);
            saveUserPK(PUBLIC_KEY, auth.currentUser)
        } catch (error) {
            setError(true)
        }
    };

    /**
     * @description metodo di gestione del login normale, usa il metodo signInWithEmailAndPassword di firebase. poi viene richiamato  @generateUserChats per generare il doc di userChats dell'account.
     * in fine viene richimato il metodo @generateUserKeys per la generazione della coppia di key di sessione
     * @param {*} e 
     */
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

            localStorage.setItem('secretKey', SECRET_KEY); 

            saveUserPK(PUBLIC_KEY, auth.currentUser);
            updateStatus(auth.currentUser);
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
                            <form onSubmit={handleSignIn}>
                                <MDBInput wrapperClass='mb-4' label='Email address' id='formEmail' required type='email' size="lg" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                {error.email && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.email}</p>}
                                <MDBInput wrapperClass='mb-4' label='Password' autoComplete="on" id='formPassword' required type='password' size="lg" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                {error.password && <p style={{color: "red"}}><MDBIcon fab icon='exclamation ' className="mx-2"/>{error.password}</p>}
                                <div className="d-flex justify-content-between mx-4 mb-4">
                                    <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                                    <p>No account?<Link to="/Registration" style={{color:'#91b3fa'}}>  Create one</Link></p>
                                </div>

                                <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor:'#91b3fa', color:'black'}}>
                                    <MDBIcon icon='sign-in-alt ' className="mx-2"/>
                                    Sign in
                                </MDBBtn>
                                {error && <span>You have entered an invalid email or password</span>}

                                <div className="divider flex align-items-center my-4">
                                    <p className="text-center fw-bold mx-3 mb-0" style={{marginTop:'-20px', paddingBottom:'20px'}}>OR</p>
                                </div>
                            </form>
                            <MDBBtn className="ms-2 w-100" size="lg" onClick={handleGuestSignIn} style={{backgroundColor: '#e9effd', color:'black'}}>
                                <MDBIcon icon='user-alt ' className="mx-2"/>
                                    Continue as a guest
                            </MDBBtn>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}

export default Login;