import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

const firebaseConfig = {
  apiKey: "AIzaSyDPIHT2q5z5zFPettdeX3ZRUe_AH_1eek",
  authDomain: "ironmind-8e547.firebaseapp.com",
  projectId: "ironmind-8e547",
  storageBucket: "ironmind-8e547.appspot.com",
  messagingSenderId: "645905953126",
  appId: "1:645905953126:web:04d2ae6adfd254686198a7",
  measurementId: "G-S42VHTRQHS"
};

const app = initializeApp(firebaseConfig);

export const generateToken = async () => {
  if (!VAPID_KEY) {
    console.error("Missing VAPID key! Add VITE_VAPID_KEY in .env file.");
    return null;
  }

  if (!(await isSupported())) {
    console.warn("This browser does not support Firebase Messaging.");
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    console.log("FCM Token:", token);
    return token;

  } catch (error) {
    console.error("Error generating FCM token:", error);
    return null;
  }
};
