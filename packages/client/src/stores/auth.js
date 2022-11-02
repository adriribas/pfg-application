import { defineStore, acceptHMRUpdate } from 'pinia';
import router from '@/router';
import { authApi } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    refreshing: null,
    userData: {},
    authToken: localStorage.getItem('authToken') || ''
  }),
  getters: {
    isLoggedIn: state => !!state.authToken,
    defaultView: state => state.userData.defaultView,
    fullName: state => `${state.userData.firstName} ${state.userData.lastName}`,
    school: state => state.userData.school,
    role: state => state.userData.role,
    study: state => state.userData.study,
    tabs() {
      return router
        .getRoutes()
        .reduce(
          (accum, route) =>
            this.role && route.meta?.role === this.role
              ? [...accum, { title: route.meta?.title, routeName: route.name }]
              : accum,
          []
        );
    },
    hasAccessTo() {
      return viewName => !!this.tabs.find(({ routeName }) => routeName === viewName);
    }
  },
  actions: {
    refreshUserData() {
      this.refreshing = new Promise(async res => {
        if (!this.authToken) {
          this.userData = {};
          return res();
        }

        try {
          const { data: user } = await authApi.getCurrentUser();
          this.userData = user;
        } catch (e) {
          this.userData = {};
          this.authToken = '';
        }

        return res();
      });
    },
    logout() {
      this.authToken = '';
      this.refreshUserData();
      router.push({ name: 'login' });
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
