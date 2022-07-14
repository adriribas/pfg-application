import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import 'normalize.css';

import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(Quasar, { plugins: {} });

app.mount('#app');
