import React from "react";
import { generateToken } from "./utils/Firebase";


export default function TestFCM() {
  const testFirebase = async () => {
    const token = await generateToken();
    console.log("TEST RESULT:", token);
    if (token) {
      alert("Firebase Messaging WORKS! Token generated.");
    } else {
      alert("Firebase Messaging FAILED. Check console.");
    }
  };

  return (
    <button 
      onClick={testFirebase}
      style={{
        padding: "12px 20px",
        background: "green",
        color: "white",
        borderRadius: 6,
        border: "none",
        marginTop: 20
      }}
    >
      Test Firebase Notification
    </button>
  );
}
