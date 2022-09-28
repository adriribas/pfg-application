import { defineStore, acceptHMRUpdate } from 'pinia';

import { useAuthStore } from '.';
import { schoolsApi } from '@/api';

export const useSchoolsStore = defineStore('schools', {
  state: () => ({
    school: null,
    loading: false,
    errorMsg: ''
  }),
  getters: {
    startYear: state => state.school?.currentStartYear,
    endYear: state => state.school?.currentEndYear,
    hasPlaDocent() {
      return !!this.startYear;
    },
    nextStartYear() {
      return this.hasPlaDocent ? this.startYear + 1 : new Date().getFullYear();
    },
    nextEndYear() {
      return this.hasPlaDocent ? this.endYear + 1 : new Date().getFullYear() + 1;
    }
  },
  actions: {
    async refreshSchoolData() {
      this.loading = true;
      const authStore = useAuthStore();
      const schoolAbv = authStore.school;
      if (schoolAbv) {
        try {
          const { data: school } = await schoolsApi.get(schoolAbv);
          this.school = school;
        } catch (e) {
          this.errorMsg = e.message;
          console.error('Error getting school data', e);
        }
      }
      this.loading = false;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSchoolsStore, import.meta.hot));
}
