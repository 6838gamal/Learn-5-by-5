// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// import { getAnalytics, type Analytics } from "firebase/analytics"; // Optional: if you plan to use Firebase Analytics

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeN1mxcNwQqOyBtLE2AgZoBzf5exPYBoc",
  authDomain: "learn-5-by-5.firebaseapp.com",
  projectId: "learn-5-by-5",
  storageBucket: "learn-5-by-5.appspot.com", // Keeping the standard storage bucket format
  messagingSenderId: "434056178407",
  appId: "1:434056178407:web:b530c6318de3bb58471042",
  measurementId: "G-DJRHLSN6TV"
};

let app: FirebaseApp;
// let analytics: Analytics; // Optional: if you plan to use Firebase Analytics

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Optional: Initialize Analytics if measurementId is present and you want to use it
  // if (firebaseConfig.measurementId) {
  //   analytics = getAnalytics(app);
  // }
} else {
  app = getApps()[0];
  // Optional: Get Analytics instance if app was already initialized
  // if (firebaseConfig.measurementId && typeof window !== 'undefined') { // Check for window for client-side
  //   try {
  //     analytics = getAnalytics(app);
  //   } catch (e) {
  //     console.warn("Firebase Analytics could not be initialized (perhaps already initialized or in server context).")
  //   }
  // }
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Export 'analytics' if you decide to use it
export { app, auth, db, storage };
