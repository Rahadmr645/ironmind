import React, {createContext,useEffect, useState} from  'react';
import {getUserFromToken} from '../utils/DecodeToken.jsx'
export const AuthContext = createContext();


export const AuthContextProvider = ({children}) =>{
  
  const [showLogin, setShowLogin] = useState(false);
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [currState, setCurrState] = useState('Signup');
    const [user, setUser] = useState(null);
   const [showAddTask, setShowAddTask] = useState(false);
    
    
    
    //const URL = import.meta.env.VITE_API_URL;
    const URL = "http://192.168.8.225:5003"

 useEffect(() => {
   const decoded = getUserFromToken();
   console.log(decoded);
   if(decoded) setUser(decoded)
 }, []);
    
    
    
const contextValu= {
  showMenuForm,
  setShowMenuForm,
  showLogin,
  setShowLogin,
  currState,
  setCurrState,
  URL,
  user,
  setUser,
  showAddTask, 
  setShowAddTask, 
}  
  
  return (
        <AuthContext.Provider value={contextValu}>
          {children}
        </AuthContext.Provider>
    );
};