import { defineStore, acceptHMRUpdate } from 'pinia';

import { authApi } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: {},
    authToken: localStorage.getItem('authToken') || ''
  }),
  getters: {
    isLoggedIn: state => !!state.authToken,
    defaultView: state => state.userData.defaultView
  },
  actions: {
    async refreshUserData() {
      if (!this.isLoggedIn) {
        return (this.userData = {});
      }
      try {
        this.userData = (await authApi.getCurrentUser()).data;
      } catch (e) {
        this.userData = {};
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
