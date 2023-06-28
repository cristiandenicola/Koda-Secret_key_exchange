// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDV3i2JU7IExvfCaTJqrOw2Q56PQ6rM-ew",
  authDomain: "koda-project-247be.firebaseapp.com",
  projectId: "koda-project-247be",
  storageBucket: "koda-project-247be.appspot.com",
  messagingSenderId: "1364573348",
  appId: "1:1364573348:web:5edfd01642ab9203ad3a31"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage();
export const db = getFirestore();

export default app