import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// API Bilgileri doğrudan buraya yazıldı (Env sorunlarını aşmak için)
const firebaseConfig = {
    apiKey: "AIzaSyDugYyvOGeLZgbBVNvfrkslYGqsT4O1CnM",
    authDomain: "hadis-19a1a.firebaseapp.com",
    projectId: "hadis-19a1a",
    storageBucket: "hadis-19a1a.firebasestorage.app",
    messagingSenderId: "578394345609",
    appId: "1:578394345609:web:78f787ff44b34efba03658",
    measurementId: "G-D74BJ45BTN"
};

// Singleton pattern
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
