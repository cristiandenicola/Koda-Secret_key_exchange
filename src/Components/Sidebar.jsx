import React from "react";
import NavbarAccount from "./NavbarAccount";
import Search from "./Search";
import Chats from "./Chats";
import '../style.css'

/**
 * @description Uno dei due macro component dentro account
 * component che fa da padre a quelli inglobati
 * @returns 
 */
const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavbarAccount/>
            <Search/>
            <Chats/>
        </div>
    );
};

export default Sidebar;