import { defineStore, acceptHMRUpdate } from 'pinia';
import _ from 'lodash';

import { subjectsApi } from '@/api';
import { useCalendar } from '@/util';

const debug = (...msgs) => console.log(`[Overlapping]`, ...msgs);

export const useOverlappingStore = defineStore('overlapping', {
  state: () => ({
    semester: 0,
    labTypes: [],
    labTypesOccupation: [[], [], [], [], []],
    selWeek: 'general',
    selLabTypes: [],
    selDay: -1
  }),
  getters: {
    labTypeNames: state => state.labTypes.map(({ name }) => name),
    overlappingStripes: state => day => {
      const { getDuration } = useCalendar();
      const overlappingStripes = [];

      if (state.selDay === -1 || day === state.selDay) {
        state.selLabTypes.forEach(labTypeName => {
          const labTypeOccupation = state.labTypesOccupation[day].find(({ name }) => name === labTypeName);
          if (!labTypeOccupation) {
            return;
          }
          const { amount } = state.labTypes.find(({ name }) => name === labTypeName);

          labTypeOccupation.stripes[state.selWeek].forEach(({ start, end, timeBlocks }) => {
            if (timeBlocks.length >= amount) {
              overlappingStripes.push({ start, duration: getDuration(start, end) });
            }
          });
        });
      }

      return overlappingStripes;
    },
    overlapsWith: state => (week, day, start, end, labTypes) => {
      // Retorna array d'estudis ({abv,name,course}) amb els que es solapa.
    }
  },
  actions: {
    setSelectedWeek(week = 'general') {
      this.selWeek = week;
    },
    setSelectedLabTypes(labTypes = []) {
      this.selLabTypes = labTypes.map(({ name }) => name);
    },
    setSelectedDay(day = -1) {
      this.selDay = day;
    },
    clear() {
      this.setSelectedLabTypes();
      this.setSelectedDay();
    },
    initLabTypesOverlapping(semester, subjects) {
      this.semester = semester;
      this.labTypes = this.getSubjectsLabTypes(subjects);
      this.refreshLabTypesOverlapping();
    },
    async refreshLabTypesOverlapping() {
      this.getDayByDayTimeBlocks(await this.loadImplicatedSubjects()).map(this.makeDayStripes);
    },
    getSubjectsLabTypes: subjects =>
      _.uniqBy(
        subjects.reduce(
          (accum, { labTypes }) => [
            ...accum,
            ...labTypes.map(labType => _.pick(labType, ['name', 'amount']))
          ],
          []
        ),
        'name'
      ),
    async loadImplicatedSubjects() {
      const { data: subjects } = await subjectsApi.list({
        params: { fields: 'code,name', include: 'Study,Group' },
        filterData: { semester: this.semester },
        associations: { labType: this.labTypeNames }
      });
      debug('subjects', subjects);
      return subjects;
    },
    getDayByDayTimeBlocks: subjects => {
      const { getEndTime } = useCalendar();
      const dayByDayTimeBlocks = [[], [], [], [], []];

      subjects.forEach(({ LabTypes: labTypes, Groups: groups, Studies: subjectStudies }) => {
        groups
          .filter(({ type }) => type === 'small')
          .forEach(({ TimeBlocks: timeBlocks, Studies: groupStudies }) => {
            timeBlocks.forEach(({ day, start, duration, week }) => {
              if (day || day === 0) {
                dayByDayTimeBlocks[day].push({
                  start,
                  end: getEndTime(start, duration),
                  week,
                  labTypes: labTypes.map(({ name }) => name),
                  studies: groupStudies.map(groupStudy => {
                    const subjectStudy = subjectStudies.find(({ abv }) => abv === groupStudy.abv);
                    return {
                      abv: groupStudy.abv,
                      name: groupStudy.name,
                      course: !subjectStudy ? 0 : subjectStudy.StudySubject.course
                    };
                  })
                });
              }
            });
          });
      });

      return dayByDayTimeBlocks;
    },
    makeDayStripes(timeBlocks, day) {
      this.labTypesOccupation[day] = this.classifyByLabTypes(timeBlocks).map(this.getLabTypeStripes);
    },
    classifyByLabTypes: timeBlocks => {
      const timeBlocksByLabTypes = [];

      timeBlocks.forEach(({ labTypes, ...timeBlock }) =>
        labTypes.forEach(labTypeName => {
          const labType = timeBlocksByLabTypes.find(({ name }) => name === labTypeName);
          if (labType) {
            labType.timeBlocks.push(timeBlock);
          } else {
            timeBlocksByLabTypes.push({ name: labTypeName, timeBlocks: [timeBlock] });
          }
        })
      );

      return timeBlocksByLabTypes;
    },
    getLabTypeStripes({ name, timeBlocks }) {
      const { timeElemsCollide } = useCalendar();
      const stripes = {};

      Object.entries(this.getDivisionsByWeek(timeBlocks)).forEach(([week, divisions]) => {
        stripes[week] = [];
        if (!divisions.length) {
          return;
        }

        stripes[week].push({ start: divisions[0], timeBlocks: [] });
        for (let i = 1; i < divisions.length; i++) {
          stripes[week].at(-1).end = divisions[i];
          if (i < divisions.length - 1) {
            stripes[week].push({ start: divisions[i], timeBlocks: [] });
          }
        }

        (week === 'general'
          ? timeBlocks
          : timeBlocks.filter(timeBlock => !timeBlock.week || timeBlock.week === week)
        ).forEach(timeBlock =>
          stripes[week].forEach(stripe => {
            if (timeElemsCollide(stripe, timeBlock)) {
              stripe.timeBlocks.push(timeBlock);
            }
          })
        );
      });

      return { name, stripes };
    },
    getDivisionsByWeek: timeBlocks => {
      const { timeToMinutes } = useCalendar();
      const divisions = {
        general: [],
        A: [],
        B: []
      };

      timeBlocks.forEach(({ start, end, week }) => {
        divisions.general.push(start, end);
        if (!week || week === 'A') {
          divisions.A.push(start, end);
        }
        if (!week || week === 'B') {
          divisions.B.push(start, end);
        }
      });

      Object.keys(divisions).forEach(
        week =>
          (divisions[week] = _.uniq(divisions[week]).sort(
            (time1, time2) => timeToMinutes(time1) - timeToMinutes(time2)
          ))
      );

      return divisions;
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOverlappingStore, import.meta.hot));
}
