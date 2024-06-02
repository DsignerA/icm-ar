// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/ARScene.vue'; // Ensure path is correct

const routes = [
  { path: '/', component: Home }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
