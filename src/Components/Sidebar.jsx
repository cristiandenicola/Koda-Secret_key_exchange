import React from "react";
import NavbarAccount from "./NavbarAccount";
import Search from "./Search";
import Chats from "./Chats";
import '../style.css'

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