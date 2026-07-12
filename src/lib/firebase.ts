import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Read from firebase-applet-config.json or use hardcoded safe defaults matching our project
const firebaseConfig = {
  apiKey: "AIzaSyAG0iWNaCDGQci1LjYxqnkqjhIBp3ze4M4",
  authDomain: "dotted-maxim-v40ks.firebaseapp.com",
  projectId: "dotted-maxim-v40ks",
  storageBucket: "dotted-maxim-v40ks.firebasestorage.app",
  messagingSenderId: "52143984830",
  appId: "1:52143984830:web:5fd4a425ed0e657a7b0eef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection popup every time
googleProvider.setCustomParameters({
  prompt: "select_account"
});
