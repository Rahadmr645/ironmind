import React from "react";
import "./NotificationPopup.css";

const NotificationPopup = ({ show, onClose, onAllow }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>🔔 Enable Notifications</h2>
        <p>
          To stay updated with your tasks, please allow notifications.
        </p>

        <div className="popup-buttons">
          <button className="allow-btn" onClick={onAllow}>Allow Notifications</button>
          <button className="close-btn" onClick={() => onClose(false)}>Later</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
