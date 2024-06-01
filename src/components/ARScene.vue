<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AR Wallet</title>
  <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://cdn.rawgit.com/jeromeetienne/AR.js/dev/aframe/build/aframe-ar.js"></script>
  <script src="https://rawgit.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js"></script>
  <script src="https://raw.githack.com/fcor/arjs-gestures/master/dist/gestures.js"></script>
  <script src="https://rawgit.com/mayognaise/aframe-gif-shader/master/dist/aframe-gif-shader.min.js"></script>
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>

  <!-- Font Awesome for Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <style>
    /* Your CSS styles here */
  </style>
</head>
<body>

  <div id="app" style="overflow:auto;">
    <button class="icon-button" style="left: 10px;" @click="openNav"><i class="fas fa-bars"></i></button>
    <button class="icon-button" style="right: 10px;" @click="displayInventory"><i class="fas fa-box"></i></button>

    <div id="mySidebar" class="sidebar">
      <a href="javascript:void(0)" class="closebtn" @click="closeNav">&times;</a>
      <div id="auth-buttons">
        <button class="button" @click="signup">Sign Up</button>
        <button class="button" @click="login">Login</button>
      </div>
    </div>
    <button class="icon-button logout-button" @click="logout" style="display: none;"><i class="fas fa-sign-out-alt"></i></button>
    <div id="inventory-icons"></div>

    <div style='margin: 0px; overflow: hidden;'>
      <a-scene 
        loading-screen="dotsColor: white; backgroundColor: black" 
        id="scene" 
        cursor="fuse: false; rayOrigin: mouse;" 
        embedded 
        arjs="sourceType: webcam; detectionMode: mono; maxDetectionRate: 30; canvasWidth: 240; canvasHeight: 180; debugUIEnabled: false;" 
        vr-mode-ui="enabled: false"
        arjs-gesture-detector
      >
        <a-assets>
          <a-asset-item id="apt1" src="https://rvanfts.com/ar/1-branded-chips/scene.gltf"></a-asset-item>
          <a-asset-item id="apt2" src="https://rvanfts.com/ar/ps5/scene.gltf"></a-asset-item>
        </a-assets>

        <a-marker preset="hiro" id="marker1">
          <a-entity 
            raycaster="objects: .clickable" 
            position="0 0 0" 
            id="myapt1" 
            scale="1 1 1" 
            rotation="-50 0 0" 
            gltf-model="#apt1" 
            class="clickable" 
            visible="true" 
            gesture-handler
          ></a-entity>
        </a-marker>

        <a-marker type="pattern" url="https://rvanfts.com/ar/1patterns/main-ar.patt" id="marker2">
          <a-entity 
            raycaster="objects: .clickable" 
            position="0 0 0" 
            id="myapt2" 
            scale="1 1 1" 
            rotation="-50 0 0" 
            gltf-model="#apt2" 
            class="clickable" 
            visible="true" 
            gesture-handler
          ></a-entity>
        </a-marker>

        <a-entity camera></a-entity>
      </a-scene>
    </div>

    <div id="info-box">
      <p id="info-name"></p>
      <p id="info-description"></p>
      <p id="info-addedAt"></p>
      <button class="button" @click="mintItem">Collect</button>
    </div>

    <div id="loader" class="loader" style="display: none;"></div>
  </div>

  <script>
    const app = Vue.createApp({
      data() {
        return {
          currentItem: null,
          allowClicks: false,
          defaultSceneVisible: true,
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
          const user = firebase.auth().currentUser;
          if (user) {
            const userRef = firebase.firestore().collection('users').doc(user.uid);
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
          const user = firebase.auth().currentUser;
          if (user) {
            const userRef = firebase.firestore().collection('users').doc(user.uid);
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
          const objectRef = firebase.firestore().collection('objects').doc(markerId);
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
        async signup() {
          const email = prompt('Enter your email:');
          const password = prompt('Enter your password:');
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              firebase.firestore().collection('users').doc(user.uid).set({
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
        async login() {
          const email = prompt('Enter your email:');
          const password = prompt('Enter your password:');
          firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
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
        async logout() {
          firebase.auth().signOut().then(() => {
            alert('Logout successful!');
            document.getElementById('signup-button').style.display = 'block';
            document.getElementById('login-button').style.display = 'block';
            document.getElementById('logout-button').style.display = 'none';
          }).catch((error) => {
            alert(error.message);
          });
        },
        checkAuthState() {
          firebase.auth().onAuthStateChanged((user) => {
            if (user && document.getElementById("mySidebar").style.width !== "0px") {
              document.getElementById('logout-button').style.display = 'block';
            } else {
              document.getElementById('logout-button').style.display = 'none';
            }
          });
        },
        handleMarkerEvents(markerId, entityId) {
          const marker = document.getElementById(markerId);
          marker.addEventListener('markerFound', async () => {
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

          marker.addEventListener('markerLost', () => {
            this.allowClicks = false;
            this.currentItem = null;
          });

          document.getElementById(entityId).addEventListener('click', async () => {
            if (this.allowClicks) {
              const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
              await this.fetchMarkerData(markerDataId);
              const infoBox = document.getElementById('info-box');
              infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
            }
          });
        },
        async loadMarkers() {
          const scene = document.querySelector('a-scene');
          const objectsRef = firebase.firestore().collection('objects');
          try {
            const snapshot = await objectsRef.get();
            if (snapshot.empty) {
              this.defaultSceneVisible = true;
            } else {
              this.defaultSceneVisible = false;
              snapshot.forEach(doc => {
                const data = doc.data();
                const marker = document.createElement('a-marker');
                marker.setAttribute('preset', 'custom');
                marker.setAttribute('type', 'pattern');
                marker.setAttribute('url', data.patternUrl);
                marker.setAttribute('id', `marker-${doc.id}`);

                const entity = document.createElement('a-entity');
                entity.setAttribute('gltf-model', data.modelUrl);
                entity.setAttribute('scale', data.scale);
                entity.setAttribute('rotation', data.rotation);
                entity.setAttribute('position', data.position);
                entity.setAttribute('id', `entity-${doc.id}`);
                entity.classList.add('clickable');
                entity.setAttribute('gesture-handler', '');

                marker.appendChild(entity);
                scene.appendChild(marker);
                this.handleMarkerEvents(`marker-${doc.id}`, `entity-${doc.id}`);
              });
            }
          } catch (error) {
            console.error('Error loading markers: ', error);
          }
        }
      },
      mounted() {
        this.loadMarkers();

        const loader = document.getElementById('loader');
        const myapt = document.getElementById('myapt');
        if (myapt) {
          myapt.addEventListener('model-loading', () => {
            loader.style.display = 'block';
            myapt.setAttribute('visible', 'false');
          });
          myapt.addEventListener('model-loaded', () => {
            loader.style.display = 'none';
            myapt.setAttribute('visible', 'true');
          });
        }

        this.checkAuthState();
      }
    });

    app.mount('#app');
  </script>
</body>
