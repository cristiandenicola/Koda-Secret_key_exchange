import React from "react";
import Chat from "./Chat";
import Sidebar from "./Sidebar";

/**
 * @description Component principale che viene sviluppato dopo che l'utente ha eseguito login o registrazione
 * Account è composto da due sotto-components: Sidebar: ha il compito di mostrare le info utente e permettere di fare ricerca e gestire le chat;
 * Chat: component a dx che ha il compito principale di fornire la UI per la comunicazione tra i due utenti.
 * @returns
 */
const Account = () => {
    return (
        <div className="home">
            <Sidebar/>
            <Chat/>
        </div>
    );
}
export default Account;