// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3bPfg-tF0ENtUp58HdWG1R46d-PB3ySU",
  authDomain: "strangertattoo-223d6.firebaseapp.com",
  projectId: "strangertattoo-223d6",
  storageBucket: "strangertattoo-223d6.firebasestorage.app",
  messagingSenderId: "485590711731",
  appId: "1:485590711731:web:f15bc6a8f969e8d9af9fc6",
  measurementId: "G-VL2BXDX8KY"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
