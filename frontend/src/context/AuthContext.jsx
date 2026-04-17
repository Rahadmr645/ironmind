import React, { createContext, useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/DecodeToken.jsx'
export const AuthContext = createContext();


export const AuthContextProvider = ({ children }) => {

  const [showLogin, setShowLogin] = useState(false);
  const [currState, setCurrState] = useState('SignUp');
  const [user, setUser] = useState(null);




  // check GPS and permission properly
const checkLocation = () => {
  if (!("geolocation" in navigator)) {
    alert("Your device does not support location.");
    return;
  }

  navigator.permissions.query({ name: "geolocation" }).then((result) => {
    if (result.state === "granted") {
      console.log("Permission granted");
      return; // GPS allowed, no need to spam the user
    }

    if (result.state === "prompt") {
      // First-time user → Will show browser popup ONE TIME
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {
          alert("Please enable location in your browser settings.");
        }
      );
      return;
    }

    if (result.state === "denied") {
      alert("Location is blocked. Go to browser settings to enable it.");
    }
  });
};


  useEffect(() => {
    checkLocation();
  }, [])




  const URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

  useEffect(() => {
    const decoded = getUserFromToken();
    console.log(decoded);
    if (decoded) setUser(decoded)
  }, []);



  const contextValu = {
    showLogin,
    setShowLogin,
    currState,
    setCurrState,
    URL,
    user,
    setUser,
  }

  return (
    <AuthContext.Provider value={contextValu}>
      {children}
    </AuthContext.Provider>
  );
};