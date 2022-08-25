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
  <div class="bg-b0 text-white">
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-g12">
        <TheNavigationTopBar />
      </q-header>
      <q-page-container class="absolute-full">
        <!-- <div class="fit scroll"> -->
        <q-scroll-area dark class="fit">
          <router-view #default="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </q-scroll-area>
        <!-- </div> -->
      </q-page-container>
      <!-- <q-footer elevated class="bg-g10 text-white">
        <TheFooter />
      </q-footer> -->
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
