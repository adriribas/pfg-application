<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';

import { useAuthStore } from '@/stores';
import { authApi } from '../api';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const logIn = async () => {
  try {
    const {
      data: { userData, token }
    } = await authApi.logIn({ email: form.value.email, secret: form.value.password });
    authStore.$patch({ userData, authToken: token });
    router.push({ name: authStore.defaultView });
  } catch (e) {
    // Tractament d'errors de login
    console.error('Login error', e);
    alert(e.message);
  }
};
</script>

<template>
  <section>
    <div class="loginDiv">
      <div class="loginDivInner">
        <h1>Autenticació</h1>
        <hr />
        <form @submit.prevent="logIn">
          <input type="email" placeholder="Correu electrònic" v-model="form.email" class="defInput" />
          <br />
          <input type="password" placeholder="Contrasenya" v-model="form.password" class="defInput" />
          <br />
          <input type="submit" value="Entrar" class="button-3" />
          <p>No recordes la contrasenya?</p>
          <RouterLink :to="{ name: 'resetPassword' }">Restableix-la aquí</RouterLink>
        </form>
      </div>
    </div>
  </section>
</template>

<style>
hr {
  display: block;
  height: 1px;
  width: 40%;
  border: 0;
  border-top: 1px solid #2ea44f;
  margin-bottom: 30px;
  padding: 0;
}
p {
  margin-top: 55px;
}
.defInput {
  margin-top: 10px;
  margin-bottom: 20px;
  color: rgb(43, 40, 40);
  font-size: 12pt;
  width: 100%;
  height: 25px;
}
section {
  display: table;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
.loginDiv {
  display: table-cell;
  vertical-align: middle;
}
.loginDivInner {
  background-color: rgb(43, 40, 40);
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  padding: 50px;
  border-radius: 20px;
}
h1 {
  font-size: 40pt;
  margin: unset;
  margin-bottom: 20px;
}
.button-3 {
  margin-top: 20px;
  width: 40%;
  appearance: none;
  background-color: #2ea44f;
  border: 1px solid rgba(27, 31, 35, 0.15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, 0.1) 0 1px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 14pt;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 16px;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
}

.button-3:focus:not(:focus-visible):not(.focus-visible) {
  box-shadow: none;
  outline: none;
}

.button-3:hover {
  background-color: #2c974b;
}

.button-3:focus {
  box-shadow: rgba(46, 164, 79, 0.4) 0 0 0 3px;
  outline: none;
}

.button-3:disabled {
  background-color: #94d3a2;
  border-color: rgba(27, 31, 35, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: default;
}

.button-3:active {
  background-color: #298e46;
  box-shadow: rgba(20, 70, 32, 0.2) 0 1px 0 inset;
}
</style>
