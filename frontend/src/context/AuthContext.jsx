import React, {createContext, useState} from  'react';

export const AuthContext = createContext();


export const AuthContextProvider = ({children}) =>{
  
  const [showLogin, setShowLogin] = useState(false);
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [currState, setCurrState] = useState('Signup')
    //const URL = import.meta.env.VITE_API_URL;
    const URL = "http://192.168.8.225:5003"

const contextValu= {
  showMenuForm,
  setShowMenuForm,
  showLogin,
  setShowLogin,
  currState,
  setCurrState,
  URL,
}  
  
  return (
        <AuthContext.Provider value={contextValu}>
          {children}
        </AuthContext.Provider>
    );
};