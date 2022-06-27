<script setup>
import { ref } from 'vue';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const logout = () => authStore.logout();
</script>

<template>
  <h2>Plans docents</h2>
  <button @click="logout">Logout</button>
</template>

<style></style>
