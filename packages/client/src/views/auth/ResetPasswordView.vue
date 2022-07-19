<script setup>
import { ref, computed } from 'vue';

import { authApi } from '@/api';
import AuthForm from '../../components/auth/AuthForm.vue';
import EmailInput from '../../components/auth/EmailInput.vue';
import AuthContainer from '../../components/auth/AuthContainer.vue';
import ErrorRequest from '../../components/auth/ErrorRequest.vue';

const email = ref('');
const sent = ref(false);
const error = ref(null);

const errorMsg = computed(() => {
  switch (error.value.code) {
    case 'ERR_NETWORK':
      return 'Error de connexió amb el servidor.';
    case 'ERR_BAD_REQUEST':
      return "L'adreça de correu electrònic no és vàlida.";
    default:
      'Error desconegut. Prova-ho més tard.';
  }
});

const resetPassword = async () => {
  try {
    await authApi.resetPassword(email.value);
    sent.value = true;
  } catch (e) {
    error.value = e;
  }
};
</script>

<template>
  <AuthContainer
    title="Restabliment"
    :nav-text="sent ? 'Vols autenticar-te?' : 'No vols restablir la teva contrasenya?'"
    :nav-link-text="sent ? 'Fes-ho aquí' : 'Autentica\'t aquí'"
    nav-route="login">
    <ErrorRequest v-if="error && !sent" :message="errorMsg" />

    <AuthForm v-if="!sent" submit-text="Enviar" @submit="resetPassword">
      <EmailInput v-model="email" />
    </AuthForm>

    <div v-else>
      <p>S'ha enviat un correu electrònic de restabliment a</p>
      <p class="text-m5 text-weight-bold">{{ email }}</p>
    </div>
  </AuthContainer>
</template>

<style lang="sass" scoped></style>
