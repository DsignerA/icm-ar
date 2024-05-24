import { createRouter, createWebHistory } from 'vue-router';
import MainApp from '../pages/MainApp.vue';

const routes = [
  {
    path: '/',
    name: 'MainApp',
    component: MainApp
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
