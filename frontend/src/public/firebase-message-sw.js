// public/firebase-messaging-sw.js
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyDPIHT2q5z5zFPettdeX3ZRUe_AH_1eek",
  authDomain: "ironmind-8e547.firebaseapp.com",
  projectId: "ironmind-8e547",
  storageBucket: "ironmind-8e547.firebasestorage.app",
  messagingSenderId: "645905953126",
  appId: "1:645905953126:web:04d2ae6adfd254686198a7",
  measurementId: "G-S42VHTRQHS"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('Received background message ', payload);
});
