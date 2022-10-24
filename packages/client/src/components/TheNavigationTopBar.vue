<script setup>
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
</script>

<template>
  <q-tabs
    v-if="authStore.isLoggedIn"
    no-caps
    inline-label
    outside-arrows
    align="left"
    narrow-indicator
    indicator-color="m14">
    <q-route-tab
      v-for="tab in authStore.tabs"
      :key="tab.routeName"
      :to="{ name: tab.routeName }"
      :label="tab.title" />

    <q-space />

    <q-btn label="Logout" flat outline @click="authStore.logout()" />

    <q-space />

    <q-icon name="person" size="sm" />
    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-bold">
      {{ authStore.fullName }}
    </span>
    <!-- <span class="q-tab relative-position self-stretch flex flex-center text-center text-m13 separator">
      |
    </span>
    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-g6">
      {{ authStore.role }}
    </span> -->
    <span
      class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-m8 role">
      {{ authStore.role }}
    </span>
  </q-tabs>
</template>

<style lang="sass" scoped>
.separator
  font-size: 15pt
.role
  font-size: 10pt
</style>
