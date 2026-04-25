import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

export const firebaseConfig = {
    apiKey: "AIzaSyDJ51q10wnS3M44FN5ynEa448iaFIHF3vw",
    authDomain: "marktech-a89b4.firebaseapp.com",
    projectId: "marktech-a89b4",
    storageBucket: "marktech-a89b4.firebasestorage.app",
    messagingSenderId: "174835858964",
    appId: "1:174835858964:web:27a12739a8ce4e4fdcb101"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
