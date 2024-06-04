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
//import { firebase, auth, db } from '../firebase.js';
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
        userRef.update({
          inventory: firebase.firestore.FieldValue.arrayUnion(item)
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
  },
};
</script>


<style scoped>
/* Add your styles here */
</style>
