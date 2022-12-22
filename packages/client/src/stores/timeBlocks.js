import { defineStore, acceptHMRUpdate } from 'pinia';
import _ from 'lodash';

import { useCalendar } from '@/util';

// Els blocs genèrics poden tenir ids repetides amb els normals!!!!!!
// Possible sol·lució: getter al model del servidor --> `$G{id}`
// Possible sol·lució: Donar-li id quan es carreguen a front.
// Error solapament (cursos)
export const useTimeBlocksStore = defineStore('timeBlocks', {
  state: () => ({
    placed: [[], [], [], [], []],
    unplaced: []
  }),
  getters: {
    allPlaced: state => _.flatten(state.placed),
    all(state) {
      return [...this.allPlaced, ...state.unplaced];
    },
    filteredPlaced: state => filter => state.placed.map(dayTbs => dayTbs.filter(filter)),
    weekPlaced(state) {
      return week => (!week ? state.placed : this.filteredPlaced(timeBlock => timeBlock.week === week));
    },
    dayPlaced: state => day => state.placed[day],
    filteredUnplaced: state => filter => state.unplaced.filter(filter),
    weekUnplaced(state) {
      return week => (!week ? state.unplaced : this.filteredUnplaced(timeBlock => timeBlock.week === week));
    },
    filteredAll() {
      return filter => this.all.filter(filter);
    },
    findPlaced: state => (day, id) => {
      const index = state.placed[day].findIndex(timeBlock => timeBlock.id === id);

      return { index, timeBlock: state.placed[day][index] };
    },
    getPlacedBySubject() {
      return subjectCode => _.flatten(this.filteredPlaced(({ subject }) => subject?.code === subjectCode));
    },
    genericPlaced() {
      const { isGeneric } = useCalendar();

      return _.flatten(this.filteredPlaced(isGeneric));
    },
    findUnplaced: state => id => {
      const index = state.unplaced.findIndex(timeBlock => timeBlock.id === id);

      return { index, timeBlock: state.unplaced[index] };
    },
    getUnplacedBySubject() {
      return subjectCode => this.filteredUnplaced(({ subject }) => subject?.code === subjectCode);
    },
    genericUnplaced() {
      const { isGeneric } = useCalendar();

      return this.filteredUnplaced(isGeneric);
    },
    findTimeBlock() {
      return id => {
        const unplaced = this.findUnplaced(id);
        if (unplaced.index !== -1) {
          return { ...unplaced, weekDay: -1 };
        }

        for (let i = 0; i < 5; i++) {
          const placed = this.findPlaced(i, id);
          if (placed.index !== -1) {
            return { ...placed, weekDay: i };
          }
        }
      };
    }
  },

  actions: {
    resetState() {
      this.placed = [[], [], [], [], []];
      this.unplaced = [];
    },
    setTimeBlocks(timeBlocks) {
      this.resetState();
      timeBlocks.forEach(({ day, ...timeBlock }) => {
        if (!day && day !== 0) {
          this.unplaced.push(timeBlock);
        } else {
          this.placed[day].push(timeBlock);
        }
      });
    },
    refreshPlaced() {
      /* this.placed = [...this.placed]; */
    },
    addToPlaced(timeBlock, day, start, week) {
      this.placed[day].push({
        ...timeBlock,
        start,
        week: week === 'general' ? null : week
      });
    },
    removeFromPlaced(day, index) {
      this.placed[day].splice(index, 1);
    },
    addToUnplaced(timeBlock) {
      this.unplaced.push({ ...timeBlock, start: null, week: null });
    },
    removeFromUnplaced(index) {
      this.unplaced.splice(index, 1);
    },
    place(id, day, start, week) {
      const { index, timeBlock } = this.findUnplaced(id);

      this.removeFromUnplaced(index);
      this.addToPlaced(timeBlock, day, start, week);
      this.refreshPlaced();
    },
    unplace(id, day) {
      const { index, timeBlock } = this.findPlaced(day, id);

      this.removeFromPlaced(day, index);
      this.refreshPlaced();
      this.addToUnplaced(timeBlock);

      return { start: timeBlock.start, week: timeBlock.week };
    },
    move(id, currentDay, newDay, start, week) {
      const { index, timeBlock } = this.findPlaced(currentDay, id);

      this.removeFromPlaced(currentDay, index);
      this.addToPlaced(timeBlock, newDay, start, week);
      this.refreshPlaced();

      return { start: timeBlock.start, week: timeBlock.week };
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTimeBlocksStore, import.meta.hot));
}
