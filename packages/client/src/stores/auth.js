import { defineStore, acceptHMRUpdate } from 'pinia';
import _ from 'lodash';

import router from '@/router';
import userRoles from '@/config/userRoles';
import * as authApi from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: {},
    authToken: ''
  }),
  getters: {
    isLoggedIn: state => !_.isEmpty(state.userData) && !!state.authToken,
    isWhitelisted: state => view => state.userData.viewWhitelist?.includes(view),
    defaultView: state => state.userData.viewWhitelist?.at(0)
  },
  actions: {
    // .htaccess
    async login(authData) {
      const { email, password } = authData;

      try {
        const { userData, token } = await authApi.login({ email, secret: password });

        this.userData = userData;
        this.userData.viewWhitelist = userRoles[this.userData.role];
        this.authToken = token;
        authApi.setToken(token);

        console.log('User data', this.userData);
        console.log('Token', this.authToken);
        router.push({ name: this.defaultView });
      } catch (e) {
        console.error(e);
        alert(e.message);
      }
    },
    async logout() {
      authApi.clearToken();
      this.userData = {};
      this.authToken = '';
      router.push({ name: 'login' });
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
