<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import { authApi } from '@/api';
import AuthForm from '@/components/auth/AuthForm.vue';
import AuthContainer from '@/components/auth/AuthContainer.vue';

const $q = useQuasar();

const email = ref('');
const sent = ref(false);

const getErrorMsg = error => {
  const {
    response: {
      status,
      code: axiosCode,
      data: { message }
    }
  } = error;

  return status === 400
    ? message
    : axiosCode === 'ERR_NETWORK'
    ? 'Error de connexió amb el servidor.'
    : 'Error desconegut. Prova-ho més tard.';
};

const resetPassword = async () => {
  try {
    await authApi.resetPassword(email.value);
    sent.value = true;
  } catch (e) {
    $q.notify({
      type: 'error',
      message: 'Error en la sol·licitud del restabliment.',
      caption: getErrorMsg(e)
    });
  }
};
</script>

<template>
  <AuthContainer
    title="Restabliment"
    :nav-text="sent ? 'Vols autenticar-te?' : 'No vols restablir la teva contrasenya?'"
    :nav-link-text="sent ? 'Fes-ho aquí' : 'Autentica\'t aquí'"
    nav-route="login">
    <AuthForm v-if="!sent" submit-text="Sol·licitar" @submit="resetPassword">
      <EmailInput v-model="email" />
    </AuthForm>

    <div v-else>
      <div>S'ha enviat un correu electrònic de restabliment a</div>
      <div class="text-m5 text-weight-bold">{{ email }}</div>
    </div>
  </AuthContainer>
</template>

<style lang="sass" scoped></style>
