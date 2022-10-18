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
    hasPlaDocent() {
      return !!this.startYear;
    },
    startYear: state => state.school?.currentStartYear,
    endYear: state => state.school?.currentEndYear,
    course() {
      return `${this.startYear} - ${this.endYear}`;
    },
    nextStartYear() {
      return this.hasPlaDocent ? this.startYear + 1 : new Date().getFullYear();
    },
    nextEndYear() {
      return this.hasPlaDocent ? this.endYear + 1 : new Date().getFullYear() + 1;
    },
    nextCourse() {
      return `${this.nextStartYear} - ${this.nextEndYear}`;
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
