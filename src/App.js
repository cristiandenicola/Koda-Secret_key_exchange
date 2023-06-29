import React, { useContext } from "react";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Account from "./Components/Account";
import Registration from "./Components/Registration";
import AccountGuest from "./Components/AccountGuest";
import { AuthContext } from "./Context/AuthContext";
import { auth } from "./firebase";
import { BrowserRouter, Route, Routes, Navigate  } from "react-router-dom";
import "./style.css"

const App = () => {

  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children
  };

  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/registration' element={<Registration />}/> 
          <Route path='/login' element={<Login />}/>
          <Route path='/guest' 
            element={
              <ProtectedRoute>
                <AccountGuest/>
              </ProtectedRoute>
            }
          />
          <Route path='/account' 
            element={
              <ProtectedRoute>
                <Account/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
