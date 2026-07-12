import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Read from firebase-applet-config.json or use hardcoded safe defaults matching our project
const firebaseConfig = {
  apiKey: "AIzaSyB58_c3n5Xd6GbuCZuVIZ7PG-HjIgcgojk",
  authDomain: "suraj-sir-portal.firebaseapp.com",
  projectId: "suraj-sir-portal",
  storageBucket: "suraj-sir-portal.firebasestorage.app",
  messagingSenderId: "1031166717790",
  appId: "1:1031166717790:web:61982d7e4b41963dde69cf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection popup every time
googleProvider.setCustomParameters({
  prompt: "select_account"
});
