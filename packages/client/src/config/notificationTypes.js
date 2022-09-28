import { Notify } from 'quasar';

Notify.registerType('success', {
  timeout: 3000,
  icon: 'check_circle',
  progress: true,
  color: 'm15',
  textColor: 'white'
});

Notify.registerType('error', {
  timeout: 6000,
  icon: 'error',
  progress: true,
  color: 'negative',
  textColor: 'white'
});

Notify.registerType('warning', {
  icon: 'warning',
  progress: true,
  color: 'warning',
  textColor: 'white'
});
