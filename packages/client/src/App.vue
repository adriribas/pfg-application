<script setup>
import { onBeforeMount } from 'vue';

import { useAuthStore } from './stores';
import TheNavigationTopBar from './components/TheNavigationTopBar.vue';
import TheFooter from './components/TheFooter.vue';

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
  <q-layout view="hHh LpR fff">
    <q-header elevated class="bg-g11 text-white">
      <TheNavigationTopBar />
    </q-header>

    <q-page-container class="bg-b0 text-white">
      <q-page padding>
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer elevated class="bg-g10 text-white">
      <TheFooter />
    </q-footer>
  </q-layout>
</template>

<style>
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
