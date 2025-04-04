import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    sendEmailVerification,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDscY6VIiHNhRL_Q1S-GhUJXSEqB2DIMHI",
    authDomain: "desarrollo-web-ii-5d0cb.firebaseapp.com",
    projectId: "desarrollo-web-ii-5d0cb",
    storageBucket: "desarrollo-web-ii-5d0cb.firebasestorage.app",
    messagingSenderId: "211880810268",
    appId: "1:211880810268:web:d4304e2f959bd4f8728cd9",
    measurementId: "G-9N9V8FXV35"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);

export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    sendEmailVerification,
    setDoc,
    doc,
    serverTimestamp
};