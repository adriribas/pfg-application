<script setup>
import { ref } from 'vue';

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.authToken = '';
  authStore.refreshUserData();
  router.push({ name: 'login' });
};
</script>

<template>
  <h2>Plans docents</h2>
  <button @click="logout">Logout</button>
</template>

<style></style>