import React, {createContext,useEffect, useState} from  'react';
import {getUserFromToken} from '../utils/DecodeToken.jsx'
export const AuthContext = createContext();


export const AuthContextProvider = ({children}) =>{
  
  const [showLogin, setShowLogin] = useState(false);
    const [currState, setCurrState] = useState('Signup');
    const [user, setUser] = useState(null);

    
    
    
    const URL = import.meta.env.VITE_API_URL;
    //const URL = "http://10.161.68.227:5003"

 useEffect(() => {
   const decoded = getUserFromToken();
   console.log(decoded);
   if(decoded) setUser(decoded)
 }, []);
    
    
    
const contextValu= {
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