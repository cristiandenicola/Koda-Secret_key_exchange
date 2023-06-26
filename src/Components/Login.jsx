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
import nacl from 'tweetnacl';
import { doc, updateDoc } from "firebase/firestore";
import NavbarAccount from "./NavbarAccount";
import { AuthContext } from "../Context/AuthContext";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [secretKey, setSecretKey] = useState(null);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/account');

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