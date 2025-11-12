import { createContext, useContext, useState } from "react";


import { AuthContext } from './AuthContext.jsx'
export const NotificationContext = createContext();


export const NotificationContextProvider =  ({ children }) => {


    const { URL } = useContext(AuthContext);
    const [notification, setNotification] = useState(null)


    const showNotification = (data) => {
        setNotification(data);
    };

    const hideNotification = () => {
        setNotification(null)
    };


    const contextValue = {
        hideNotification,
        showNotification,
        notification,
        setNotification

    }


    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {notification && <Notification {...notification} />}
        </NotificationContext.Provider>
    )
}



export const useNotificaitoin = () => useContext(NotificationContext);