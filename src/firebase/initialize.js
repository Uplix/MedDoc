// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1b5bOkxJEys-T8Jv0hBC08UK7MPqVhwA",
  authDomain: "meddoc-6b70a.firebaseapp.com",
  projectId: "meddoc-6b70a",
  storageBucket: "meddoc-6b70a.firebasestorage.app",
  messagingSenderId: "923351622829",
  appId: "1:923351622829:web:2296188a6ade6d61769224",
  measurementId: "G-Z7F2XKD1HG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication and Firestore exports
const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, db };
