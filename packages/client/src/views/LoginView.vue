<script setup>
import { ref } from 'vue';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const login = () => authStore.login(form.value);
</script>

<template>
  <section>
    <form @submit.prevent="login">
      <h2>Autenticació</h2>
      <input type="email" placeholder="Correu electrònic" v-model="form.email" />
      <input type="password" placeholder="Contrasenya" v-model="form.password" />
      <input type="submit" value="Entrar" />
    </form>
  </section>
</template>

<style></style>
