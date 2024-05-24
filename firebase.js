// Import Firebase dependencies
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

// Firebase configuration object
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
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Export auth and db instances
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
