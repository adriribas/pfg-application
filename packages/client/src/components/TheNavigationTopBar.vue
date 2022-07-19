<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
</script>

<template>
  <!-- <q-toolbar>
    <q-toolbar-title>
      <q-avatar>
        <img src="@/assets/logos/udg-logo.png" />
      </q-avatar>
      Horaris PFG
    </q-toolbar-title>
    <q-space />
    <div v-if="authStore.isLoggedIn" class="q-mr-md q-pt-md">
      <span class="text-weight-medium">{{ authStore.fullName }}</span>
      <span class="q-mx-lg text-m5 sep">|</span>
      <span class="text-g6 role">{{ authStore.role }}</span>
    </div>
  </q-toolbar> -->
  <q-tabs
    v-if="authStore.isLoggedIn"
    no-caps
    inline-label
    outside-arrows
    align="left"
    narrow-indicator
    indicator-color="m14">
    <q-route-tab v-for="tab in authStore.tabs" :key="tab.routeName" :to="{ name: tab.routeName }" :label="tab.title" />
    <q-space />
    <q-tab icon="person" disable :label="authStore.fullName" />
    <q-tab label="-" disable content-class="text-m5" />
    <q-tab :label="authStore.role" disable content-class="text-g4" />
  </q-tabs>
</template>

<style lang="sass" scoped></style>
