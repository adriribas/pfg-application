<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { useAuthStore } from '@/stores';
import { authApi } from '@/api';
import AuthForm from '@/components/auth/AuthForm.vue';
import AuthContainer from '@/components/auth/AuthContainer.vue';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const getErrorMsg = ({ code: axiosCode, response }) => {
  if (axiosCode === 'ERR_NETWORK') {
    return 'Error de connexió amb el servidor';
  }

  const {
    status,
    data: { code, message }
  } = response;

  return status === 400
    ? code === 'ERR_INVALID_DATA'
      ? 'El format de les dades no és correcte'
      : message
    : 'Error desconegut. Prova-ho més tard';
};

const logIn = async () => {
  try {
    const {
      data: { userData, token }
    } = await authApi.logIn(email.value, password.value);

    authStore.$patch({ userData, authToken: token });
    router.push({ name: authStore.defaultView });
  } catch (e) {
    console.log('ERROR', e);
    $q.notify({
      type: 'error',
      message: "Error en l'autenticació",
      caption: getErrorMsg(e)
    });
  }
};
</script>

<template>
  <AuthContainer
    title="Autenticació"
    nav-text="No recordes la contrasenya?"
    nav-link-text="Restableix-la aquí"
    nav-route="resetPassword">
    <AuthForm submit-text="Entrar" @submit="logIn">
      <EmailInput v-model="email" />

      <PasswordInput v-model="password" toggle-icon />
    </AuthForm>
  </AuthContainer>
</template>
