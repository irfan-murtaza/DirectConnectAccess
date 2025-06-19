// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCDV67vQIHd1PtsaHv1-PJyrAh_9Hp8xE4",
//   authDomain: "direct-connect-access.firebaseapp.com",
//   projectId: "direct-connect-access",
//   storageBucket: "direct-connect-access.firebasestorage.app",
//   messagingSenderId: "438670156449",
//   appId: "1:438670156449:web:611e78874124ae375dc6e0",
//   measurementId: "G-KMBJZ22KP6",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firestore
// export const db = getFirestore(app);
// export default app;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWNbT7tvU7e4o8oB-VB3TOF5-89Z4KCQ4",
  authDomain: "directconnectaccess-3bee8.firebaseapp.com",
  projectId: "directconnectaccess-3bee8",
  storageBucket: "directconnectaccess-3bee8.firebasestorage.app",
  messagingSenderId: "115194517332",
  appId: "1:115194517332:web:befd48c1b1909bd8c1dac1",
  measurementId: "G-VJN261V380",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export default app;
