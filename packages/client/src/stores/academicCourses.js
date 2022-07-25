import { defineStore, acceptHMRUpdate } from 'pinia';
import { academicCoursesApi } from '@/api';

export const useAcademicCoursesStore = defineStore('academicCourses', {
  state: () => ({
    academicCourses: [],
    active: null
  }),
  getters: {
    loaded: state => state.academicCourses.length > 0,
    hasPast() {
      return this.past.length > 0;
    },
    past: state => state.academicCourses.slice(0, -2).reverse(),
    current: state => state.academicCourses.at(-2),
    next: state => state.academicCourses.at(-1)
  },
  actions: {
    async load() {
      const { data: academicCourses } = await academicCoursesApi.getAll();

      if (academicCourses.at(-1) !== this.next) {
        this.academicCourses = academicCourses;
        this.setActive(this.current);
      }
      if (!this.active) {
        this.setActive(this.current);
      }
    },
    setActive(academicCourse) {
      this.active = academicCourse;
      console.log('Setting active:', academicCourse);
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAcademicCoursesStore, import.meta.hot));
}
