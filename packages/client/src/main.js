import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dialog } from 'quasar';
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import 'normalize.css';

import App from '@/App.vue';
import router from '@/router';
import '@/css/color-palette.css';

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(Quasar, { plugins: { Dialog } });

app.mount('#app');
