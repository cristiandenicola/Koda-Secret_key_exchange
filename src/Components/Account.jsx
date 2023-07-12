import React from "react";
import Chat from "./Chat";
import Sidebar from "./Sidebar";

const Account = () => {

    return (
        <div className="home">
            <Sidebar/>
            <Chat/>
        </div>
    );
}

export default Account;