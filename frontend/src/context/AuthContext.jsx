import React, { createContext, useEffect, useMemo, useState } from 'react';
import { getUserFromToken } from '../utils/DecodeToken.jsx'
export const AuthContext = createContext();

function resolveApiBase() {
  const explicit = import.meta.env.VITE_API_URL;
  if (explicit) return String(explicit).replace(/\/$/, '');
  if (import.meta.env.DEV) return '';
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5003`;
  }
  return 'http://10.23.136.227:5003';
}

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




  const URL = useMemo(() => resolveApiBase(), []);

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