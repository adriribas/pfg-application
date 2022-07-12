<script setup>
import { onBeforeMount } from 'vue';
import { useAuthStore } from './stores';
import TheNavigationTopBar from './components/TheNavigationTopBar.vue';

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

<template>
  <header v-if="authStore.isLoggedIn">
    <TheNavigationTopBar />
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
body {
  background: #30353b;
  color: white;
  padding-top: 60px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
*,
:before,
:after {
  box-sizing: border-box;
}
</style>
