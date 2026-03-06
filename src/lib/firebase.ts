import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project config


const firebaseConfig = {
    apiKey: "AIzaSyBK6rt4_7VeSXIo9_-5taa2zOSjg9gwZ1w",
    authDomain: "synapse-9e0b7.firebaseapp.com",
    projectId: "synapse-9e0b7",
    storageBucket: "synapse-9e0b7.firebasestorage.app",
    messagingSenderId: "106842083495",
    appId: "1:106842083495:web:1fe7cf7afae67c0e724b82",
    measurementId: "G-1GM5VCKCTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize a secondary Firebase instance purely for creating users
// without signing out the current active user (the Doctor).
const secondaryApp = initializeApp(firebaseConfig, 'SecondaryRegistrationApp');

// Initialize Firebase services
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);

export default app;
