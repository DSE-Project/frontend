import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1F-TG-WrqEdR3r-__Znirlv8O0G4tAKI",
  authDomain: "recession-scope.firebaseapp.com",
  projectId: "recession-scope",
  storageBucket: "recession-scope.firebasestorage.app",
  messagingSenderId: "864288495143",
  appId: "1:864288495143:web:c542d1f5edb4faec4a6002",
  measurementId: "G-51LSFZ0GCB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);