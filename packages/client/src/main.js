import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dialog, Notify } from 'quasar';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import 'normalize.css';

import App from '@/App.vue';
import router from '@/router';
import StepInput from '@/components/StepInput.vue';
import '@/css/color-palette.css';
import '@/config/notificationTypes.js';

const app = createApp(App);

app.use(router).use(createPinia()).use(Quasar, { plugins: { Dialog, Notify } }).use(autoAnimatePlugin);

app.component('StepInput', StepInput);

app.mount('#app');
