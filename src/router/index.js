import { createRouter, createWebHistory } from 'vue-router';
//import MainApp from '../pages/MainApp.vue';
import ARScene from '../components/ARScene.vue';

const routes = [
  {
    path: '/',
    name: 'MainApp',
    component: ARScene
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
