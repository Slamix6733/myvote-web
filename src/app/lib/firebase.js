// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDfGQsRwKp3QpAcMF8ZAbX7k8o3HbGblhE",
    authDomain: "myvote-b9c7d.firebaseapp.com",
    projectId: "myvote-b9c7d",
    storageBucket: "myvote-b9c7d.firebasestorage.app",
    messagingSenderId: "625459329758",
    appId: "1:625459329758:web:ca4a109b38ae3a47a9a04f",
    measurementId: "G-97V462B02C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// export { auth, provider };
export default app;


