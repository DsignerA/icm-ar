<template>
    <div id="mySidebar" class="sidebar" :style="{ width: sidebarWidth }">
      <a href="javascript:void(0)" class="closebtn" @click="closeNav">&times;</a>
      <div id="auth-buttons">
        <button class="button" id="signup-button" @click="signup">Sign Up</button>
        <button class="button" id="login-button" @click="login">Login</button>
      </div>
    </div>
  </template>
  <script>
  import { auth, db } from '../firebase.js';

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
        console.log('Attempting to sign up with email:', email);
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
              email: user.email,
              inventory: []
            }).then(() => {
              console.log('User object created in Firestore');
              alert('User object created in Firestore!');
              this.checkAuthState();
            }).catch((error) => {
              console.error('Error creating user object in Firestore:', error);
            });
          })
          .catch((error) => {
            console.error('Error during sign up:', error);
            alert(error.message);
          });
      },
      login() {
        const email = prompt('Enter your email:');
        const password = prompt('Enter your password:');
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
  /* Add your styles here */
  </style>
  