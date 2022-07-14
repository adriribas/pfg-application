<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
</script>

<template>
  <q-toolbar>
    <q-toolbar-title>
      <q-avatar>
        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
      </q-avatar>
      Horaris PFG
    </q-toolbar-title>
  </q-toolbar>

  <q-tabs v-if="authStore.isLoggedIn" align="left">
    <q-route-tab v-for="tab in authStore.tabs" :key="tab.routeName" :to="{ name: tab.routeName }" :label="tab.title" />
  </q-tabs>
  <!-- <div class="nav">
    <div class="tabs">
      <RouterLink
        v-for="tab in authStore.tabs"
        :key="tab.routeName"
        :to="{ name: tab.routeName }"
        :active-class="'selectedTab'"
        custom
        v-slot="{ navigate, isActive }">
        <div class="tab" :class="[isActive && 'active-tab']" @click="navigate">
          {{ tab.title }}
        </div>
      </RouterLink>
    </div>
    <div class="user">
      <p>
        <span class="full-name">{{ `${authStore.fullName}` }}</span>
        <span class="sep">|</span>
        <span class="role">{{ `${authStore.role}` }}</span>
      </p>
    </div>
  </div> -->
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  background: linear-gradient(rgb(43, 40, 40), rgb(43, 40, 40) 30%, #30353b 99%); /* rgb(43, 40, 40); */
  height: 60px;
}
.tabs {
  margin-right: auto;
}
.tab {
  margin-left: 15px;
  margin-right: 15px;
  color: #a6a6a6;
  text-decoration: none;
  font-size: 0.98rem;
  cursor: pointer;
  display: inline;
  padding: 20px 15px 15px 10px;
  transition: 200ms;
}
.tab:hover {
  color: white;
  font-size: 13pt;
  transition: 200ms;
}
.active-tab {
  color: white;
  border-bottom: 1px solid rgb(84, 159, 84);
  padding-bottom: 8px;
  font-size: 13pt;
  transition: 50ms;
}
.user {
  margin-right: 20px;
}
.full-name {
  font-weight: bold;
}
.sep {
  margin-left: 25px;
  margin-right: 25px;
  color: rgb(84, 159, 84);
  font-size: 14pt;
}
.role {
  color: #a6a6a6;
  font-size: 11pt;
}
</style>
