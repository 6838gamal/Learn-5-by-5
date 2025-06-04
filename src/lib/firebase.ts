
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// IMPORTANT:
// The apiKey, authDomain, projectId, storageBucket, and messagingSenderId
// are set based on your "learn-5-by-5" project and the provided API key.
// Please ensure the appId below is also correct for full Firebase functionality.
const firebaseConfig = {
  apiKey: "AIzaSyDeN1mxcNwQqOyBtLE2AgZoBzf5exPYBoc",
  authDomain: "learn-5-by-5.firebaseapp.com",
  projectId: "learn-5-by-5",
  storageBucket: "learn-5-by-5.appspot.com",
  messagingSenderId: "434056178407",
  appId: "YOUR_APP_ID_HERE" // Please get this from your Firebase project settings
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Initialized Firestore

export { app, auth, db }; // Export db
