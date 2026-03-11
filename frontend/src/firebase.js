import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In a real app, these would be process.env or import.meta.env
const firebaseConfig = {
  apiKey: "DEMO_API_KEY",
  authDomain: "phc-pulse.firebaseapp.com",
  projectId: "phc-pulse",
  storageBucket: "phc-pulse.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:12abcxyz"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase not connected, using Mock Data Mode", error);
}

export { auth, db };
