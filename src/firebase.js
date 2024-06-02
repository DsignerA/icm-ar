import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp_DolCW24dLRggJ79qfsB6lKrkJ8osrQ",
  authDomain: "arwallet-bfd5e.firebaseapp.com",
  projectId: "arwallet-bfd5e",
  storageBucket: "arwallet-bfd5e.appspot.com",
  messagingSenderId: "865160955063",
  appId: "1:865160955063:web:e82191fc0207faf1fcb932",
  measurementId: "G-LV113YTC27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, collection, analytics, signInWithEmailAndPassword, createUserWithEmailAndPassword };
