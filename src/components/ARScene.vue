<template>
  <div style="margin: 0px; overflow: hidden;">
    <a-scene
      loading-screen="dotsColor: white; backgroundColor: black"
      gltf-model="dracoDecoderPath: https://rvanfts.com/draco-master/javascript/;"
      id="scene"
      cursor="fuse: false; rayOrigin: mouse;"
      embedded
      arjs="debugUIEnabled: false;"
      vr-mode-ui="enabled: false"
      artoolkit="sourceType: webcam; detectionMode: mono; maxDetectionRate: 30; canvasWidth: 240; canvasHeight: 180"
      ar-template
      renderer="logarithmicDepthBuffer: false;"
      gesture-detector
    >
    </a-scene>
  </div>
</template>

<script>
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
      allowClicks: true,
      currentItem: null,
      item: null,  // Ensure item is initialized to null
    };
  },
  methods: {
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
        document.getElementById('info-perks').innerText = item.perks ? item.perks.join(', ') : '';
        document.getElementById('info-level').innerText = item.level || '';
        document.getElementById('info-amount').innerText = item.amount || '';
        document.getElementById('info-expire').innerText = item.expire || '';
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
              console.error('Error adding default data to Firestore: ', error);
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
        const itemToAdd = {
          name: item.name || '',
          description: item.description || '',
          accessLevel: item.accessLevel || '',
          location: item.location || '',
          usageInstructions: item.usageInstructions || '',
          expiryDate: item.expiryDate || '',
          type: item.type || '',
          src: item.src || '',
          addedAt: item.addedAt || new Date().toISOString()
        };

        userRef.update({
          inventory: firebase.firestore.FieldValue.arrayUnion(itemToAdd)
        }).then(() => {
          alert('Item added to inventory!');
        }).catch((error) => {
          console.error('Error adding item to inventory:', error);
        });
      } else {
        alert('Please log in to add items to your inventory.');
      }
    },
    handleMarkerEvents(markerId, entityId) {
      const marker = document.getElementById(markerId);
      const entity = document.getElementById(entityId);
      const infoBox = document.getElementById('info-box');

      if (!marker) {
        console.error(`Marker with id ${markerId} not found.`);
        return;
      }

      if (!entity) {
        console.error(`Entity with id ${entityId} not found.`);
        return;
      }

      marker.addEventListener('markerFound', (e) => {
        console.log(`found ${markerId}`);
        this.item = {
          name: marker.getAttribute('name'),
          description: marker.getAttribute('description'),
          perks: JSON.parse(marker.getAttribute('perks')),
          level: parseInt(marker.getAttribute('level'), 10),
          amount: parseInt(marker.getAttribute('amount'), 10),
          expire: new Date(marker.getAttribute('expire')),
          type: '3d-object',
          src: entity.getAttribute('gltf-model'),
          addedAt: new Date().toISOString()
        };
        const markerDataId = encodeURIComponent(entity.getAttribute('gltf-model'));
        this.fetchMarkerData(markerDataId);
        infoBox.style.display = 'block'; // Show info box when marker is found
      });

      marker.addEventListener('markerLost', (e) => {
        console.log(`lost ${markerId}`);
        this.item = null;
        infoBox.style.display = 'none'; // Hide info box when marker is lost
      });

      entity.addEventListener('click', (evt) => {
        if (this.allowClicks) {
          const markerDataId = encodeURIComponent(entity.getAttribute('gltf-model'));
          this.fetchMarkerData(markerDataId);
          infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
        }
      });
    },
    displayInventory() {
      const user = auth.currentUser;
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
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
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
      } else {
        alert('Please log in to view your inventory.');
      }
    },
    checkAuthState() {
      auth.onAuthStateChanged((user) => {
        if (user && document.getElementById("mySidebar").style.width !== "0px") {
          console.log("User is logged in and sidebar is open.");
          document.getElementById('logout-button').style.display = 'block';
        } else {
          console.log("User is not logged in or sidebar is closed.");
          document.getElementById('logout-button').style.display = 'none';
        }
      });
    }
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
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
