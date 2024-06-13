<template>
  <div id="app">
    <Sidebar ref="sidebar" />
    <button class="icon-button" style="left: 10px;" @click="openNav"><i class="fas fa-bars"></i></button>
    <button class="icon-button" style="right: 10px;" id="view-inventory-button"><i class="fas fa-box"></i></button>
    
    <div id="inventory-icons"></div>
    <ARScene />
    <Modal v-if="isModalOpen" :isOpen="isModalOpen" :item="selectedItem" @close="closeModal" />
<div id="info-box" style="display: none;">
  <h2>{{ item.name }}</h2>
  <p>{{ item.accessLevel }}</p>
  <p>{{ item.description }}</p>
  <p>{{ item.usageInstructions }}</p>
  <p id="info-perks"></p>
  <p id="info-level"></p>
  <p id="info-amount"></p>
  <p id="info-expire"></p>
  <button @click="mintItem">Collect</button>
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
