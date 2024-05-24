import { createApp } from 'vue';
import App from './App.vue';
import './firebase'; // Ensure Firebase is initialized
import router from './router';
Vue.config.ignoredElements = [/^a-/];

createApp(App).mount('#app');
