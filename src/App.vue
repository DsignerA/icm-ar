<template>
  <div id="app">
    <Sidebar ref="sidebar" />
    <button class="icon-button" style="left: 10px;" @click="openNav"><i class="fas fa-bars"></i></button>
    <button class="icon-button" style="right: 10px;" id="view-inventory-button"><i class="fas fa-box"></i></button>
    <button class="icon-button logout-button" id="logout-button"><i class="fas fa-sign-out-alt"></i></button>
    <div id="inventory-icons"></div>
    <ARScene />
    <div id="info-box">
      <p id="info-name"></p>
      <p id="info-description"></p>
      <p id="info-addedAt"></p>
      <button class="button" id="mint-button">Collect</button>
    </div>
    <div id="loader" class="loader" style="display: none;"></div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ARScene from './components/ARScene.vue';

export default {
  components: {
    Sidebar,
    ARScene,
  },
  setup() {
    const sidebar = ref(null);

    const openNav = () => {
      if (sidebar.value) {
        sidebar.value.openNav();
      }
    };

    return {
      sidebar,
      openNav,
    };
  },
};
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('view-inventory-button').addEventListener('click', () => {
    displayInventory();
  });

</script>

<style>
/* Add your styles here */
</style>
