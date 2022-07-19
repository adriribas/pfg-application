<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { authApi } from '@/api';
import AuthForm from '../../components/auth/AuthForm.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import AuthContainer from '../../components/auth/AuthContainer.vue';
import ErrorRequest from '../../components/auth/ErrorRequest.vue';
import { onBeforeRouteUpdate } from 'vue-router';

const props = defineProps({
  token: String
});

const router = useRouter();

const password = ref('');
const repeatPassword = ref('');
const error = ref(null);

const errorMsg = computed(() => {
  switch (error.value.code) {
    case 'ERR_MATCH':
      return 'Les contrasenyes no coincideixen.';
    case 'ERR_NETWORK':
      return 'Error de connexió amb el servidor.';
    case 'ERR_BAD_REQUEST':
      switch (error.value.response.data.code) {
        case 'ERR_TOKEN':
          return 'El token no és vàlid o ha expirat.';
        case 'ERR_PWD_LENGTH':
          return 'La contrasenya ha de contenir entre 10 i 30 caràcters.';
        case 'ERR_PWD_COMPLEXITY':
          return 'La contrasenya ha de contenir com a mínim una lletra minúscula, una majúscula i un dígit.';
      }
    default:
      'Error desconegut. Prova-ho més tard.';
  }
});

const changePassword = async () => {
  try {
    if (password.value !== repeatPassword.value) {
      throw { code: 'ERR_MATCH' };
    }
    await authApi.newPassword(props.token, password.value);
    router.push({ name: 'login' });
  } catch (e) {
    console.log(e);
    error.value = e;
  }
};
</script>

<template>
  <AuthContainer title="Nova contrasenya">
    <ErrorRequest v-if="error" :message="errorMsg" />
    <AuthForm submit-text="Confirmar" @submit="changePassword">
      <PasswordInput v-model="password" toggle-icon />
      <PasswordInput v-model="repeatPassword" custom-label="Repeteix la contrasenya" toggle-icon />
    </AuthForm>
  </AuthContainer>
</template>

<style lang="sass" scoped></style>
