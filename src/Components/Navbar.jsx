import React from "react";
import { Link } from "react-router-dom";
import "../style.css";
import image from "../Assets/MicrosoftTeams-image.png"


const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="first">
            <img src={image} className="img" style={{maxHeight:'40px', maxWidth:'40px'}}/>
            <h3 className="logo"> KODA </h3>
            </div>

            <ul className="nav-links">
                <Link to ='/' className="linkStyle"><li>Sign in</li></Link>
                <Link to ='/Registration' className="linkStyle"><li>Sign up</li></Link>
            </ul>
        </nav>
    );
}

export default Navbar;