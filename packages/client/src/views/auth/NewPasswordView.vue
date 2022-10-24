<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { authApi } from '@/api';
import AuthForm from '@/components/auth/AuthForm.vue';
import AuthContainer from '@/components/auth/AuthContainer.vue';

const props = defineProps({
  reason: String,
  token: String
});

const $q = useQuasar();
const router = useRouter();

const password = ref('');
const repeatPassword = ref('');

const getErrorMsg = error => {
  const {
    response: {
      status,
      code: axiosCode,
      data: { code, message }
    }
  } = error;

  return status === 400
    ? code === 'ERR_MATCH'
      ? 'Les contrasenyes no coincideixen.'
      : message
    : axiosCode === 'ERR_NETWORK'
    ? 'Error de connexió amb el servidor.'
    : 'Error desconegut. Prova-ho més tard.';
};

const changePassword = async () => {
  try {
    if (password.value !== repeatPassword.value) {
      throw { response: { status: 400, data: { code: 'ERR_MATCH' } } };
    }

    await authApi.newPassword(props.reason, props.token, password.value);
    router.push({ name: 'login' });
  } catch (e) {
    $q.notify({
      type: 'error',
      message: "Error en l'assignació de la nova contrasenya.",
      caption: getErrorMsg(e)
    });
  }
};
</script>

<template>
  <AuthContainer title="Nova contrasenya">
    <AuthForm submit-text="Confirmar" @submit="changePassword">
      <PasswordInput v-model="password" toggle-icon />
      <PasswordInput v-model="repeatPassword" custom-label="Repeteix la contrasenya" toggle-icon />
    </AuthForm>
  </AuthContainer>
</template>

<style lang="sass" scoped></style>
