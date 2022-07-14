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
  <!-- <header v-if="authStore.isLoggedIn">
    <TheNavigationTopBar />
  </header>
  <main>
    <RouterView />
  </main> -->
  <q-layout view="hHh LpR fff">
    <q-header elevated class="bg-grey-10 text-white">
      <TheNavigationTopBar />
    </q-header>

    <q-page-container>
      <q-page padding>
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <TheFooter />
    </q-footer>
  </q-layout>
</template>

<style>
body {
  background: #30353b;
  color: white;
  /* padding-top: 60px; */
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
