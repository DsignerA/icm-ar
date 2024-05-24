<template>
    <div style="overflow:auto;">
      <!-- Your template code -->
    </div>
  </template>
  
  <script>
  import { auth, db } from '../firebase'; // Ensure the path to firebase.js is correct
  
  export default {
    data() {
      return {
        currentItem: null,
        allowClicks: false,
      };
    },
    methods: {
      openNav() {
        document.getElementById("mySidebar").style.width = "125px";
        this.checkAuthState();
      },
      closeNav() {
        document.getElementById("mySidebar").style.width = "0";
      },
      async addItemToInventory(item) {
        const user = auth.currentUser;
        if (user) {
          const userRef = db.collection('users').doc(user.uid);
          try {
            await userRef.update({
              inventory: firebase.firestore.FieldValue.arrayUnion(item)
            });
            alert('Item added to inventory!');
          } catch (error) {
            console.error('Error adding item to inventory: ', error);
          }
        } else {
          alert('Please log in to add items to your inventory.');
        }
      },
      async displayInventory() {
        const user = auth.currentUser;
        if (user) {
          const userRef = db.collection('users').doc(user.uid);
          try {
            const doc = await userRef.get();
            if (doc.exists) {
              const inventory = doc.data().inventory || [];
              const inventoryIcons = document.getElementById('inventory-icons');
              inventoryIcons.innerHTML = '';
  
              inventory.forEach(item => {
                let iconElement;
                switch (item.type) {
                  case 'info':
                  case 'image':
                    iconElement = document.createElement('img');
                    iconElement.src = item.src;
                    iconElement.classList.add('inventory-icon');
                    inventoryIcons.appendChild(iconElement);
                    break;
                  case '3d-object':
                    iconElement = document.createElement('model-viewer');
                    iconElement.setAttribute('src', item.src);
                    iconElement.setAttribute('alt', '3D Object');
                    iconElement.setAttribute('camera-controls', '');
                    iconElement.setAttribute('auto-rotate', '');
                    iconElement.setAttribute('class', 'inventory-icon');
                    inventoryIcons.appendChild(iconElement);
                    break;
                  case 'video':
                    iconElement = document.createElement('video');
                    iconElement.src = item.src;
                    iconElement.classList.add('inventory-icon');
                    iconElement.setAttribute('autoplay', 'true');
                    iconElement.setAttribute('muted', 'true');
                    inventoryIcons.appendChild(iconElement);
                    break;
                  case 'gif':
                    iconElement = document.createElement('img');
                    iconElement.src = item.src;
                    iconElement.classList.add('inventory-icon');
                    inventoryIcons.appendChild(iconElement);
                    break;
                  default:
                    break;
                }
              });
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.log("Error getting document:", error);
          }
        } else {
          alert('Please log in to view your inventory.');
        }
      },
      displayItemData(item) {
        if (item) {
          document.getElementById('info-name').innerText = item.name || '';
          document.getElementById('info-description').innerText = item.description || '';
          document.getElementById('info-addedAt').innerText = item.addedAt || '';
        }
      },
      async fetchMarkerData(markerId) {
        const objectRef = db.collection('objects').doc(markerId);
        try {
          const doc = await objectRef.get();
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
              await objectRef.set(this.currentItem);
              console.log("Default data pushed to Firestore for marker:", markerId);
            } else {
              console.error('Current item is not valid or is null');
            }
          }
        } catch (error) {
          console.error('Error getting object data: ', error);
        }
      },
      signup() {
        const email = prompt('Enter your email:');
        const password = prompt('Enter your password:');
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
              email: user.email,
              inventory: []
            }).then(() => {
              alert('User object created in Firestore!');
            }).catch((error) => {
              console.error('Error creating user object in Firestore: ', error);
            });
          })
          .catch((error) => {
            alert(error.message);
          });
      },
      login() {
        const email = prompt('Enter your email:');
        const password = prompt('Enter your password:');
        auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            alert('Login successful!');
            this.checkAuthState();
          })
          .catch((error) => {
            alert(error.message);
          });
      },
      mintItem() {
        if (this.currentItem) {
          this.addItemToInventory(this.currentItem);
        } else {
          alert('No item is currently set to mint.');
        }
      },
      logout() {
        auth.signOut().then(() => {
          alert('Logout successful!');
          document.getElementById('signup-button').style.display = 'block';
          document.getElementById('login-button').style.display = 'block';
          document.getElementById('logout-button').style.display = 'none';
        }).catch((error) => {
          alert(error.message);
        });
      },
      checkAuthState() {
        auth.onAuthStateChanged((user) => {
          if (user && document.getElementById("mySidebar").style.width !== "0px") {
            document.getElementById('logout-button').style.display = 'block';
          } else {
            document.getElementById('logout-button').style.display = 'none';
          }
        });
      },
      handleMarkerEvents(markerId, entityId) {
        const marker = document.getElementById(markerId);
        marker.addEventListener('markerFound', async (e) => {
          this.allowClicks = true;
          this.currentItem = {
            name: `3D Object ${markerId}`,
            description: `This is a 3D object ${markerId} from the AR experience.`,
            type: '3d-object',
            src: document.getElementById(entityId).getAttribute('gltf-model'),
            addedAt: new Date().toISOString()
          };
          const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
          await this.fetchMarkerData(markerDataId);
        });
  
        marker.addEventListener('markerLost', (e) => {
          this.allowClicks = false;
          this.currentItem = null;
        });
  
        document.getElementById(entityId).addEventListener('click', async (evt) => {
          if (this.allowClicks) {
            const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
            await this.fetchMarkerData(markerDataId);
            const infoBox = document.getElementById('info-box');
            infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
          }
        });
      }
    },
    mounted() {
      this.handleMarkerEvents('marker1', 'myapt1');
      this.handleMarkerEvents('marker2', 'myapt2');
  
      const loader = document.getElementById('loader');
      const myapt = document.getElementById('myapt');
      myapt.addEventListener('model-loading', () => {
        loader.style.display = 'block';
        myapt.setAttribute('visible', 'false');
      });
      myapt.addEventListener('model-loaded', () => {
        loader.style.display = 'none';
        myapt.setAttribute('visible', 'true');
      });
  
      this.checkAuthState();
    }
  };
  </script>
  
  <style>
  /* Include your styles here */
  </style>
  