<template>
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
</template>

<script>
import { onMounted, ref } from 'vue';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  collection, 
  getDocs 
} from "firebase/firestore";

export default {
  setup() {
    const currentItem = ref(null);
    const allowClicks = ref(false);
    const defaultSceneVisible = ref(true);

    const openNav = () => {
      document.getElementById("mySidebar").style.width = "125px";
      checkAuthState();
    };

    const closeNav = () => {
      document.getElementById("mySidebar").style.width = "0";
    };

    const addItemToInventory = async (item) => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, {
            inventory: arrayUnion(item)
          });
          alert('Item added to inventory!');
        } catch (error) {
          console.error('Error adding item to inventory: ', error);
        }
      } else {
        alert('Please log in to add items to your inventory.');
      }
    };

    const displayInventory = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const inventory = docSnap.data().inventory || [];
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
    };

    const displayItemData = (item) => {
      if (item) {
        document.getElementById('info-name').innerText = item.name || '';
        document.getElementById('info-description').innerText = item.description || '';
        document.getElementById('info-addedAt').innerText = item.addedAt || '';
      }
    };

    const fetchMarkerData = async (markerId) => {
      const objectRef = doc(db, 'objects', markerId);
      try {
        const docSnap = await getDoc(objectRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            displayItemData(data);
          } else {
            console.error('No data found in document:', markerId);
          }
        } else {
          console.log("No data found in Firestore for marker:", markerId);
          if (currentItem.value) {
            displayItemData(currentItem.value);
            await setDoc(objectRef, currentItem.value);
            console.log("Default data pushed to Firestore for marker:", markerId);
          } else {
            console.error('Current item is not valid or is null');
          }
        }
      } catch (error) {
        console.error('Error getting object data: ', error);
      }
    };

    const signup = async () => {
      const email = prompt('Enter your email:');
      const password = prompt('Enter your password:');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          inventory: []
        });
        alert('User object created in Firestore!');
      } catch (error) {
        alert(error.message);
      }
    };

    const login = async () => {
      const email = prompt('Enter your email:');
      const password = prompt('Enter your password:');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
        checkAuthState();
      } catch (error) {
        alert(error.message);
      }
    };

    const mintItem = () => {
      if (currentItem.value) {
        addItemToInventory(currentItem.value);
      } else {
        alert('No item is currently set to mint.');
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        alert('Logout successful!');
        document.getElementById('signup-button').style.display = 'block';
        document.getElementById('login-button').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';
      } catch (error) {
        alert(error.message);
      }
    };

    const checkAuthState = () => {
      onAuthStateChanged(auth, (user) => {
        if (user && document.getElementById("mySidebar").style.width !== "0px") {
          document.getElementById('logout-button').style.display = 'block';
        } else {
          document.getElementById('logout-button').style.display = 'none';
        }
      });
    };

    const handleMarkerEvents = (markerId, entityId) => {
      const marker = document.getElementById(markerId);
      marker.addEventListener('markerFound', async () => {
        allowClicks.value = true;
        currentItem.value = {
          name: `3D Object ${markerId}`,
          description: `This is a 3D object ${markerId} from the AR experience.`,
          type: '3d-object',
          src: document.getElementById(entityId).getAttribute('gltf-model'),
          addedAt: new Date().toISOString()
        };
        const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
        await fetchMarkerData(markerDataId);
      });

      marker.addEventListener('markerLost', () => {
        allowClicks.value = false;
        currentItem.value = null;
      });

      document.getElementById(entityId).addEventListener('click', async () => {
        if (allowClicks.value) {
          const markerDataId = encodeURIComponent(document.getElementById(entityId).getAttribute('gltf-model'));
          await fetchMarkerData(markerDataId);
          const infoBox = document.getElementById('info-box');
          infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
        }
      });
    };

    const loadMarkers = async () => {
      const scene = document.querySelector('a-scene');
      const objectsRef = collection(db, 'objects');
      try {
        const snapshot = await getDocs(objectsRef);
        if (snapshot.empty) {
          defaultSceneVisible.value = true;
        } else {
          defaultSceneVisible.value = false;
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
            handleMarkerEvents(`marker-${doc.id}`, `entity-${doc.id}`);
          });
        }
      } catch (error) {
        console.error('Error loading markers: ', error);
      }
    };

    onMounted(() => {
      loadMarkers();

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

      checkAuthState();
    });

    return {
      openNav,
      closeNav,
      signup,
      login,
      mintItem,
      logout,
      displayInventory
    };
  }
};
</script>

<style>
/* Your CSS styles here */
</style>
