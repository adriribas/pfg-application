import { defineStore, acceptHMRUpdate } from 'pinia';
import router from '@/router';
import { authApi } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: {},
    authToken: localStorage.getItem('authToken') || ''
  }),
  getters: {
    isLoggedIn: state => !!state.authToken,
    defaultView: state => state.userData.defaultView,
    fullName: state => `${state.userData.firstName} ${state.userData.lastName}`,
    role: state => state.userData.role,
    tabs() {
      return router
        .getRoutes()
        .reduce(
          (accum, route) =>
            route.meta?.role === this.role ? [...accum, { title: route.meta?.title, routeName: route.name }] : accum,
          []
        );
    }
  },
  actions: {
    async refreshUserData() {
      if (!this.isLoggedIn) {
        return (this.userData = {});
      }
      try {
        const { data: user } = await authApi.getCurrentUser();
        this.userData = user;
      } catch (e) {
        this.userData = {};
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
