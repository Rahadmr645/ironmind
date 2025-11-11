import React, { createContext } from "react";



export const PunistContext = createContext();


export const PunistContextProvider = ({ children }) => {


    const contextValue = {

    }


    return (
        <PunistContext.Provider value={contextValue}>
            {children}
        </PunistContext.Provider>
    )
}