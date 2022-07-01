<script setup>
import { onBeforeMount } from 'vue';

import { useAuthStore } from './stores';

const authStore = useAuthStore();

onBeforeMount(() => {
  authStore.refreshUserData();
  authStore.$subscribe((_mutation, state) => {
    if (!state.authToken) {
      return localStorage.removeItem('authToken');
    }
    localStorage.setItem('authToken', state.authToken);
  });
});
</script>
<template><RouterView /></template>
<style>
body {
  background: #2c3e50;
  color: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
a {
  color: inherit;
}
</style>
