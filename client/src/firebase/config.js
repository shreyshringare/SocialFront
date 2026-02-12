import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// PASTE YOUR KEYS FROM STEP 1.9 HERE:
const firebaseConfig = {
  apiKey: "AIzaSyBXJxS2rJFUQH9gFqS_KvTnSO109Ui0hvc",
  authDomain: "docs-clone-2306d.firebaseapp.com",
  projectId: "docs-clone-2306d",
  storageBucket: "docs-clone-2306d.firebasestorage.app",
  messagingSenderId: "323512684812",
  appId: "1:323512684812:web:d6a3d844f98e824a013929",
  measurementId: "G-M2BD1FXQ39",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // This is the "Auth" object we will use to login
