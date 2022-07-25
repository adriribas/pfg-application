<script setup>
import { ref } from 'vue';

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import AcademicCourseSelector from '../../components/AcademicCourseSelector.vue';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.authToken = '';
  authStore.refreshUserData();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="header">
    <button @click="logout">Logout</button>
    <AcademicCourseSelector />
  </div>
</template>

<style>
.header {
  text-align: center;
}
</style>
