<script setup>
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/index.js';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.authToken = '';
  authStore.refreshUserData();
  router.push({ name: 'login' });
};
</script>

<template>
  <q-toolbar>
    <q-toolbar-title>
      <div>
        Peu
        <button @click="logout">Logout</button>
      </div>
    </q-toolbar-title>
  </q-toolbar>
</template>

<style scoped></style>
