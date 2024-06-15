<template>
  <div id="app">
    <Sidebar ref="sidebar" />
    <button class="icon-button" style="left: 10px;" @click="openNav"><i class="fas fa-bars"></i></button>
    <button class="icon-button" style="right: 10px;" id="view-inventory-button"><i class="fas fa-box"></i></button>
    
    <div id="inventory-icons"></div>
    <ARScene />
    <Modal v-if="isModalOpen" :isOpen="isModalOpen" :item="selectedItem" @close="closeModal" />
<div id="info-box" v-if="item">
  <h2>{{ item.name }}</h2>
  <p>{{ item.accessLevel }}</p>
  <p>{{ item.description }}</p>
  <p>{{ item.usageInstructions }}</p>
  <p>{{ item.perks ? item.perks.join(', ') : '' }}</p>
  <p>{{ item.level }}</p>
  <p>{{ item.amount }}</p>
  <p>{{ item.expire }}</p>
  <button class="button" @click="mintItem">Collect</button>
</div>
<div v-else>
  <p>No item detected. Please hover over a marker.</p>
</div>


    <div id="loader" class="loader" style="display: none;"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ARScene from './components/ARScene.vue';
import Modal from './components/Modal.vue';
import { auth, db } from './firebase.js'; // Import Firebase configuration
import { collection, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

export default {
  components: {
    Sidebar,
    ARScene,
    Modal,
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
       // infoBox.style.display = 'block'; // Show info box when marker is found
      });

      marker.addEventListener('markerLost', (e) => {
        console.log(`lost ${markerId}`);
        this.item = null;
        //infoBox.style.display = 'none'; // Hide info box when marker is lost
      });
      entity.addEventListener('click', (evt) => {
        if (this.allowClicks) {
          const markerDataId = encodeURIComponent(entity.getAttribute('gltf-model'));
          this.fetchMarkerData(markerDataId);
          //infoBox.style.display = (infoBox.style.display === 'none' || infoBox.style.display === '') ? 'block' : 'none';
        }
      });
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
  setup() {
    const sidebar = ref(null);
    const isModalOpen = ref(false);
    const selectedItem = ref(null);

    const openNav = () => {
      if (sidebar.value) {
        sidebar.value.openNav();
      }
    };

    const displayInventory = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(collection(db, 'users'), user.uid);
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
                iconElement.addEventListener('click', () => openModal(item));
                inventoryIcons.appendChild(iconElement);
                break;
              case '3d-object':
                iconElement = document.createElement('model-viewer');
                iconElement.setAttribute('src', item.src);
                iconElement.setAttribute('alt', '3D Object');
                iconElement.setAttribute('camera-controls', '');
                iconElement.setAttribute('auto-rotate', '');
                iconElement.setAttribute('class', 'inventory-icon');
                iconElement.addEventListener('click', () => openModal(item));
                inventoryIcons.appendChild(iconElement);
                break;
              case 'video':
                iconElement = document.createElement('video');
                iconElement.src = item.src;
                iconElement.classList.add('inventory-icon');
                iconElement.setAttribute('autoplay', 'true');
                iconElement.setAttribute('muted', 'true');
                iconElement.addEventListener('click', () => openModal(item));
                inventoryIcons.appendChild(iconElement);
                break;
              case 'gif':
                iconElement = document.createElement('img');
                iconElement.src = item.src;
                iconElement.classList.add('inventory-icon');
                iconElement.addEventListener('click', () => openModal(item));
                inventoryIcons.appendChild(iconElement);
                break;
              default:
                break;
            }
          });
        } else {
          console.log("No such document!");
        }
      } else {
        alert('Please log in to view your inventory.');
      }
    };

    const openModal = (item) => {
      selectedItem.value = item;
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
      selectedItem.value = null;
    };

    onMounted(() => {
      const viewInventoryButton = document.getElementById('view-inventory-button');
      if (viewInventoryButton) {
        viewInventoryButton.addEventListener('click', displayInventory);
      }
    });

    return {
      sidebar,
      openNav,
      isModalOpen,
      selectedItem,
      closeModal,
    };
  },
  
};
</script>

<style>
/* Add your styles here */
</style>
