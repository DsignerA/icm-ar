<template>
  <div>
    <div :style="{ width: sidebarWidth }" id="mySidebar" class="sidebar">
      <a href="javascript:void(0)" class="closebtn" @click="closeNav">×</a>
      <a href="javascript:void(0)" id="signup-button" @click="signup">Sign Up</a>
      <a href="javascript:void(0)" id="login-button" @click="login">Log In</a>
      <a href="javascript:void(0)" id="logout-button" style="display: none;" @click="logout">Log Out</a>
    </div>
    <div id="main">
      <button class="openbtn" @click="openNav()">☰ Open Sidebar</button>
    </div>
  </div>
</template>

<script>

// Firebase configuration
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

export default {
  data() {
    return {
      sidebarWidth: '0',
    };
  },
  methods: {
    openNav() {
      this.sidebarWidth = '125px';
      this.checkAuthState();
    },
    closeNav() {
      this.sidebarWidth = '0';
    },
    signup() {
      const email = prompt('Enter your email:');
      const password = prompt('Enter your password:');

      if (!email || !password) {
        alert('Email and password cannot be empty.');
        return;
      }

      console.log('Attempting to sign up with email:', email);
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('User signed up:', userCredential.user);
          const user = userCredential.user;

          return db.collection('users').doc(user.uid).set({
            email: user.email,
            inventory: []
          });
        })
        .then(() => {
          console.log('User object created in Firestore');
          alert('User object created in Firestore!');
          this.checkAuthState();
        })
        .catch((error) => {
          console.error('Error during sign up or Firestore write:', error);
          alert(error.message);
        });
    },
    login() {
      const email = prompt('Enter your email:');
      const password = prompt('Enter your password:');
      if (email && password) {
        console.log('Attempting to log in with email:', email);
        auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            console.log('User logged in:', userCredential.user);
            alert('Login successful!');
            this.checkAuthState();
          })
          .catch((error) => {
            console.error('Error during log in:', error);
            alert(error.message);
          });
      } else {
        alert('Email and password cannot be empty.');
      }
    },
    logout() {
      console.log('Attempting to sign out');
      auth.signOut().then(() => {
        console.log('User signed out');
        alert('Logout successful!');
        this.checkAuthState();
      }).catch((error) => {
        console.error('Error during sign out:', error);
        alert(error.message);
      });
    },
    checkAuthState() {
      auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        if (user) {
          document.getElementById('signup-button').style.display = 'none';
          document.getElementById('login-button').style.display = 'none';
          document.getElementById('logout-button').style.display = 'block';
        } else {
          document.getElementById('signup-button').style.display = 'block';
          document.getElementById('login-button').style.display = 'block';
          document.getElementById('logout-button').style.display = 'none';
        }
      });
    },
  },
  mounted() {
    this.checkAuthState();
  },
};
</script>

<style scoped>
.sidebar {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
}

.sidebar a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

.sidebar a:hover {
  color: #f1f1f1;
}

.sidebar .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

.openbtn {
  font-size: 20px;
  cursor: pointer;
  background-color: #111;
  color: white;
  padding: 10px 15px;
  border: none;
}

.openbtn:hover {
  background-color: #444;
}
</style>
