// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Ensure this path is correct
import './firebase'; // Ensure Firebase is initialized

const app = createApp(App);
app.use(router);

// Ignore custom elements starting with 'a-' to prevent Vue warnings
app.config.compilerOptions.isCustomElement = tag => tag.startsWith('a-');

app.mount('#app');
