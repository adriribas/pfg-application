<script setup>
import { useAuthStore, useSchoolsStore } from './stores';
import TheNavigationTopBar from './components/TheNavigationTopBar.vue';

const authStore = useAuthStore();
const schoolStore = useSchoolsStore();

(async () => {
  authStore.refreshUserData();
  await authStore.refreshing;
  await schoolStore.refreshSchoolData();

  authStore.$subscribe((_mutation, state) => {
    schoolStore.refreshSchoolData();
    if (!state.authToken) {
      return localStorage.removeItem('authToken');
    }
    localStorage.setItem('authToken', state.authToken);
  });
})();
</script>

<template>
  <div class="bg-b0 text-white">
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-g12">
        <TheNavigationTopBar />
      </q-header>

      <q-page-container class="absolute-full">
        <q-scroll-area dark class="fit">
          <router-view />
        </q-scroll-area>
      </q-page-container>
    </q-layout>
  </div>
</template>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
*,
:before,
:after
  box-sizing: border-box
::-webkit-scrollbar
  width: 8px
  background: transparent
::-webkit-scrollbar-thumb
  background-color: $b2
  border-radius: 10px
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1)
::-webkit-scrollbar-thumb:hover
  background-color: $b1
</style>
