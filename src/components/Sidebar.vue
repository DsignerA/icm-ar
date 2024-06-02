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
  import firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/firestore';
  
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
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  export default {
    data() {
      return {
        sidebarWidth: '0',
        allowClicks: true,
        currentItem: null,
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
      onAssetLoaded(assetId) {
        console.log(`Asset ${assetId} loaded successfully.`);
      },
      onAssetError(assetId) {
        console.error(`Failed to load asset ${assetId}.`);
      },
      onMarkerFound(markerId) {
        console.log(`Marker ${markerId} found.`);
      },
      onMarkerLost(markerId) {
        console.log(`Marker ${markerId} lost.`);
      },
      onModelLoaded(entityId) {
        console.log(`Model ${entityId} loaded successfully.`);
      },
      onModelError(entityId) {
        console.error(`Failed to load model ${entityId}.`);
      },
      displayItemData(item) {
        if (item) {
          document.getElementById('info-name').innerText = item.name || '';
          document.getElementById('info-description').innerText = item.description || '';
          document.getElementById('info-addedAt').innerText = item.addedAt || '';
        }
      },
      fetchMarkerData(markerId) {
        const objectRef = db.collection('objects').doc(markerId);
        objectRef.get().then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data) {
              this.displayItemData(data);
            } else {
              console.error('No data found in document:', markerId);
            }
          } else {
            console.log("No data found in Firestore for marker:", markerId);
            if (this.currentItem) {
              this.displayItemData(this.currentItem);
              objectRef.set(this.currentItem).then(() => {
                console.log("Default data pushed to Firestore for marker:", markerId);
              }).catch((error) => {
                console.error('Error adding default data to Firestore:', error);
              });
            } else {
              console.error('Current item is not valid or is null');
            }
          }
        }).catch((error) => {
          console.error('Error getting object data:', error);
        });
      },
      addItemToInventory(item) {
        const user = auth.currentUser;
        if (user) {
          const userRef = db.collection('users').doc(user.uid);
          userRef.update({
            inventory: firebase.firestore.FieldValue.arrayUnion(item)
          }).then(() => {
            alert('Item added to inventory!');
          }).catch((error) => {
            console.error('Error adding item to inventory:', error);
            alert('Error adding item to inventory:', error.message);
          });
        } else {
          alert('Please log in to add items to your inventory.');
        }
      },
      handleMarkerEvents(markerId, entityId) {
        const marker = document.getElementById(markerId);
        marker.addEventListener('markerFound', (e) => {
          console.log(`found ${markerId}`);
          this.currentItem = {
            name: `3D Object ${markerId}`,
            description: `This is a 3D object ${markerId} from the AR experience.`,
            type: '3d-object',
            src: document.getElementById(entityId).getAttribute('gltf-model'),
            addedAt: new Date().toISOString()
          };
          const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
          this.fetchMarkerData(markerDataId);
        });
  
        marker.addEventListener('markerLost', (e) => {
          console.log(`lost ${markerId}`);
          this.currentItem = null;
        });
  
        document.getElementById(entityId).addEventListener('click', (evt) => {
          if (this.allowClicks) {
            const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
            this.fetchMarkerData(markerDataId);
            const infoBox = document.getElementById('info-box');
            infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
          }
        });
      },
    },
    mounted() {
      console.log('ARScene component mounted.');
      this.handleMarkerEvents('marker1', 'myapt1');
      this.handleMarkerEvents('marker2', 'myapt2');
  
      document.getElementById('mint-button').addEventListener('click', () => {
        if (this.currentItem) {
          this.addItemToInventory(this.currentItem);
        } else {
          alert('No item is currently set to mint.');
        }
      });
  
      document.getElementById('view-inventory-button').addEventListener('click', this.displayInventory);
      this.checkAuthState();
    },
  };
  </script>
  <style scoped>
  /* Add your styles here */
  </style>
  