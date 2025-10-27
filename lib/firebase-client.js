import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3bPfg-tF0ENtUp58HdWG1R46d-PB3ySU",
  authDomain: "strangertattoo-223d6.firebaseapp.com",
  projectId: "strangertattoo-223d6",
  storageBucket: "strangertattoo-223d6.firebasestorage.app",
  messagingSenderId: "485590711731",
  appId: "1:485590711731:web:f15bc6a8f969e8d9af9fc6",
  measurementId: "G-VL2BXDX8KY"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();