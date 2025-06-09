// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWNbT7tvU7e4o8oB-VB3TOF5-89Z4KCQ4",
  authDomain: "directconnectaccess-3bee8.firebaseapp.com",
  projectId: "directconnectaccess-3bee8",
  storageBucket: "directconnectaccess-3bee8.firebasestorage.app",
  messagingSenderId: "115194517332",
  appId: "1:115194517332:web:befd48c1b1909bd8c1dac1",
  measurementId: "G-VJN261V380"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export default app; 