import { defineStore, acceptHMRUpdate } from 'pinia';

import { academicCoursesApi } from '@/api';

export const useAcademicCoursesStore = defineStore('academicCourses', {
  state: () => ({
    academicCourses: [],
    selected: null,
    loading: false,
    error: ''
  }),
  getters: {
    amount: state => state.academicCourses.length,
    loaded() {
      return this.amount > 0;
    },
    hasPast() {
      return this.past.length > 0;
    },
    past(state) {
      return this.amount <= 2 ? [] : state.academicCourses.slice(0, -2).reverse();
    },
    previous() {
      return this.past[0];
    },
    current(state) {
      return state.academicCourses.at(this.amount === 1 ? 0 : -2);
    },
    hasNext() {
      return !!this.next;
    },
    next(state) {
      return this.amount === 1 ? null : state.academicCourses.at(-1);
    }
  },
  actions: {
    async load() {
      if (!this.amount) {
        this.reload();
      }
    },
    async reload() {
      this.loading = true;
      try {
        const { data: academicCourses } = await academicCoursesApi.list();
        this.academicCourses = academicCourses;
        this.setSelected(this.current.startYear);
      } catch (e) {
        console.error('Error reloading academic courses', e);
        this.error = e.message;
      }
      this.loading = false;
    },
    setSelected(startYear) {
      const academicCourse = this.academicCourses.find(
        academicCourse => academicCourse.startYear === startYear
      );
      if (!academicCourse) {
        return console.warn('Academic course not found', startYear);
      }
      this.selected = academicCourse;
      console.log('Selected academic course:', startYear);
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAcademicCoursesStore, import.meta.hot));
}
