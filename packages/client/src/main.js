import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.provide('axios', app.config.globalProperties.axios);

app.mount('#app');
