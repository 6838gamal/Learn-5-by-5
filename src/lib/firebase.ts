
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Added Firestore

// IMPORTANT:
// Replace the placeholder values below with your actual Firebase project configuration.
// You can find this configuration in your Firebase project settings.
// Firebase Authentication (especially social logins) will NOT work without this.
const firebaseConfig = {
  apiKey: "AIzaSyDeN1mxcNwQqOyBtLE2AgZoBzf5exPYBoc",
  authDomain: "learn-5-by-5.firebaseapp.com", // Updated based on new projectId
  projectId: "learn-5-by-5",                // Updated projectId
  storageBucket: "learn-5-by-5.appspot.com", // Updated based on new projectId
  messagingSenderId: "434056178407",       // From previous update
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
