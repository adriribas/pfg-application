<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores';
import { authApi } from '@/api';
import AuthForm from '../../components/auth/AuthForm.vue';
import EmailInput from '../../components/auth/EmailInput.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import AuthContainer from '../../components/auth/AuthContainer.vue';
import ErrorRequest from '../../components/auth/ErrorRequest.vue';

const router = useRouter();
const authStore = useAuthStore();

const authForm = ref(null);
const email = ref('');
const password = ref('');
const error = ref(null);

const errorMsg = computed(() => {
  switch (error.value.code) {
    case 'ERR_NETWORK':
      return 'Error de connexió amb el servidor.';
    case 'ERR_BAD_REQUEST':
      return 'Les credencials no són vàlides.';
    default:
      'Error desconegut. Prova-ho més tard.';
  }
});

const logIn = async () => {
  try {
    const {
      data: { userData, token }
    } = await authApi.logIn(email.value, password.value);
    authStore.$patch({ userData, authToken: token });
    router.push({ name: authStore.defaultView });
  } catch (e) {
    error.value = e;
  }
};
</script>

<template>
  <AuthContainer
    title="Autenticació"
    nav-text="No recordes la contrasenya?"
    nav-link-text="Restableix-la aquí"
    nav-route="resetPassword">
    <ErrorRequest v-if="error" :message="errorMsg" />

    <AuthForm submit-text="Entrar" ref="authForm" @submit="logIn">
      <EmailInput v-model="email" />
      <PasswordInput v-model="password" :toggle-icon="true" />
    </AuthForm>
  </AuthContainer>
</template>
