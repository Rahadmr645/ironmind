import React, { useEffect } from 'react'

import './Notificaiton.css'
const Notification = ({ title, message, type = 'info', duration, nonDismissible }) => {

    useEffect(() => {
        if (!nonDismissible && duration) {
            const timer = setTimeout(() => {
                document.querySelector(".notification-overlay")?.remove();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, nonDismissible])
    return (
        <div className='notification-overlay'>
            <h3>{title}</h3>
            <p>{message}</p>
            {!nonDismissible && <button onClick={() => document.querySelector('.notification-overplay')?.remove()}>x</button>}
        </div>
    )
}

export default Notification;