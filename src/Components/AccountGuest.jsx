import React from "react";
import Chat from "./ChatGuest";
import Sidebar from "./SidebarGuest";

const AccountGuest = () => {
    return (
        <div className="home">
            <Sidebar/>
            <Chat/>
        </div>
    );
}
export default AccountGuest;