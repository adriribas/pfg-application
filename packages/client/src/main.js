import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dialog, Notify } from 'quasar';
import QCalendarPlugin from '@quasar/quasar-ui-qcalendar/dist/index.esm.js';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/animate/rubberBand.css';
import 'quasar/src/css/index.sass';
import '@quasar/quasar-ui-qcalendar/dist/index.css';
import 'normalize.css';

import App from '@/App.vue';
import router from '@/router';
import ViewLoadingSpinner from '@/components/ViewLoadingSpinner.vue';
import MenuItemToggle from '@/components/menuItems/MenuItemToggle.vue';
import MenuItemAction from '@/components/menuItems/MenuItemAction.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import StepInput from '@/components/inputs/StepInput.vue';
import EmailInput from '@/components/inputs/EmailInput.vue';
import PasswordInput from '@/components/inputs/PasswordInput.vue';
import TimeInput from '@/components/inputs/TimeInput.vue';
import '@/css/general.css';
import '@/css/color-palette.css';
import '@/config/notificationTypes.js';

const app = createApp(App);

app
  .use(router)
  .use(createPinia())
  .use(Quasar, { plugins: { Dialog, Notify }, config: { screen: { bodyClasses: true } } })
  .use(QCalendarPlugin.default)
  .use(autoAnimatePlugin);

app
  .component('ViewLoadingSpinner', ViewLoadingSpinner)
  .component('MenuItemToggle', MenuItemToggle)
  .component('MenuItemAction', MenuItemAction)
  .component('Breadcrumbs', Breadcrumbs)
  .component('StepInput', StepInput)
  .component('EmailInput', EmailInput)
  .component('PasswordInput', PasswordInput)
  .component('TimeInput', TimeInput);

app.mount('#app');
