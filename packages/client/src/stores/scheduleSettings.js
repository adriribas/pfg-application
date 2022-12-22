import { defineStore, acceptHMRUpdate } from 'pinia';
import _ from 'lodash';

const debug = (...msgs) => console.log('[Schedule settings]', ...msgs);

export const useScheduleSettingsStore = defineStore('scheduleSettings', {
  state: () => ({
    toggle: {
      assignationFilter: false,
      studyFilter: true
    },
    check: {
      timeBlocksOverlapping: true,
      labTypesOverlapping: true,
      professorsOverlapping: true,
      roomsOverlapping: true
    }
  }),
  getters: {},
  actions: {}
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScheduleSettingsStore, import.meta.hot));
}
