// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDV67vQIHd1PtsaHv1-PJyrAh_9Hp8xE4",
  authDomain: "direct-connect-access.firebaseapp.com",
  projectId: "direct-connect-access",
  storageBucket: "direct-connect-access.firebasestorage.app",
  messagingSenderId: "438670156449",
  appId: "1:438670156449:web:611e78874124ae375dc6e0",
  measurementId: "G-KMBJZ22KP6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export default app;
