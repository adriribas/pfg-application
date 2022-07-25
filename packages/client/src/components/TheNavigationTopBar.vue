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
    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center">
      {{ authStore.fullName }}
    </span>
    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-m13"> | </span>
    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-g6">
      {{ authStore.role }}
    </span>
  </q-tabs>
</template>

<style lang="sass" scoped></style>
