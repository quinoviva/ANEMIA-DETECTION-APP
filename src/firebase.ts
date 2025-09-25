import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// For more information, visit: https://firebase.google.com/docs/web/setup
const firebaseConfig = {
  apiKey: "AIzaSyDKzlBYrYBxm--xHIcsSzEiXt0plSdnbQo", // IMPORTANT: Get this from your Firebase project settings
  authDomain: "anemia-1a16d.firebaseapp.com",
  projectId: "anemia-1a16d",
  storageBucket: "anemia-1a16d.appspot.com",
  messagingSenderId: "710836108374",
  appId: "1:710836108374:web:de363091418f66f883cff7", // IMPORTANT: Get this from your Firebase project settings
  measurementId: "G-506146745"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };