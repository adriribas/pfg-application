import _ from 'lodash';

import { useConstants } from '.';

const calcIntervalStart = (startHour, minutes) => startHour * (60 / minutes);

const calcIntervalCount = (startHour, endHour, minutes) => (60 / minutes) * (endHour - startHour);

const getHr = time => +time.split(':')[0];

const getMin = time => +time.split(':')[1];

const timeToMinutes = timeString => getHr(timeString) * 60 + getMin(timeString);

const padStartZero = value => `${value > 9 ? '' : '0'}${value}`;

const minutesToTime = minutes =>
  `${padStartZero(Math.trunc(minutes / 60))}:${padStartZero(Math.round(minutes % 60))}`;

const getEndMinutes = (startTime, duration) => timeToMinutes(startTime) + duration;

const getEndTime = (startTime, duration) => minutesToTime(getEndMinutes(startTime, duration));

const getDuration = (startTime, endTime) => timeToMinutes(endTime) - timeToMinutes(startTime);

const getNearestIntervalTime = pxValue => {
  const { scheduleIntervalStartTime, scheduleIntervalMinutes, scheduleIntervalHeight } = useConstants();
  return minutesToTime(
    (Math.round(pxValue / scheduleIntervalHeight) +
      timeToMinutes(scheduleIntervalStartTime) / scheduleIntervalMinutes) *
      scheduleIntervalMinutes
  );
};

const getMinPlaceableTime = () => {
  const { scheduleIntervalStartTime, scheduleIntervalMinutes, scheduleIntervalMargin } = useConstants();

  return minutesToTime(
    timeToMinutes(scheduleIntervalStartTime) + scheduleIntervalMargin * scheduleIntervalMinutes
  );
};

const getMaxPlaceableTime = () => {
  const { scheduleIntervalEndTime, scheduleIntervalMinutes, scheduleIntervalMargin } = useConstants();

  return minutesToTime(
    timeToMinutes(scheduleIntervalEndTime) - scheduleIntervalMargin * scheduleIntervalMinutes
  );
};

const getDurationMaxMinutes = () =>
  timeToMinutes(getMaxPlaceableTime()) - timeToMinutes(getMinPlaceableTime());

const isValidDurationMinutes = (durationMinutes, startTime) => {
  const { scheduleIntervalStartTime, scheduleIntervalEndTime, scheduleDurationMin } = useConstants();

  return _.inRange(
    durationMinutes,
    scheduleDurationMin,
    timeToMinutes(scheduleIntervalEndTime) - timeToMinutes(startTime || scheduleIntervalStartTime)
  );
};

const isValidDurationTime = (durationTime, startTime) =>
  isValidDurationMinutes(timeToMinutes(durationTime), startTime);

const clampMinutes = minutes =>
  _.clamp(minutes, timeToMinutes(getMinPlaceableTime()), timeToMinutes(getMaxPlaceableTime()));

const timeElemsCollide = ({ start: s1, end: e1 }, { start: s2, end: e2 }) => e1 > s2 && s1 < e2;

const collide = ({ start: s1, duration: d1 }, { start: s2, duration: d2 }) =>
  timeElemsCollide({ start: s1, end: getEndTime(s1, d1) }, { start: s2, end: getEndTime(s2, d2) });

const layoutTimeBlocks = timeBlocks => {
  const groups = []; // Grups
  let columns = []; // Conjunt de columnes que forma un grup
  let lastTimeBlockEndMinutes = 0; // Hora (en minuts) de fi del bloc que
  // acaba més tard del grup que s'està formant
  timeBlocks
    .sort((tb1, tb2) => {
      const startDiff = timeToMinutes(tb1.start) - timeToMinutes(tb2.start);

      if (startDiff) {
        return startDiff;
      }

      return getEndMinutes(tb1.start, tb1.duration) - getEndMinutes(tb2.start, tb2.duration);
    }) // Ordenació de més aviat a més tard
    .forEach(timeBlock => {
      if (lastTimeBlockEndMinutes && timeToMinutes(timeBlock.start) >= lastTimeBlockEndMinutes) {
        // L'hora de fi del bloc que acaba més tard del grup és més petita
        // que la d'inici del següent bloc a processar: el grup ja està
        // complet i se'n crea un de nou
        groups.push(columns);
        columns = [];
        lastTimeBlockEndMinutes = 0;
      }
      // Busca una columna l'últim bloc de la qual no col·lisioni amb el
      // que s'està processant
      const col = columns.find(col => !collide(col.at(-1), timeBlock));
      if (col) {
        // Si es troba, significa que el bloc que s'està processant no
        // col·lisiona amb cap dels d'aquella columna (per l'ordenació)
        col.push(timeBlock);
      } else {
        // Si no es troba, significa que sí que col·lisiona amb els blocs
        // de la columna i, per tant, ha de pertànyer a una de nova
        columns.push([timeBlock]);
      }
      const endMinutes = getEndMinutes(timeBlock.start, timeBlock.duration);
      if (lastTimeBlockEndMinutes <= endMinutes) {
        // El bloc que s'estava processant acaba més tard que l'últim del grup
        lastTimeBlockEndMinutes = endMinutes;
      }
    });
  // Concatena la llista de grups amb l'últim grup calculat
  return [...groups, columns];
};

const sortTimeBlocks = timeBlocks =>
  timeBlocks.sort(({ id: id1, group: group1 }, { id: id2, group: group2 }) => {
    if (group1.type !== group2.type) {
      if (group1.type === 'big') {
        return -1;
      }
      if (group2.type === 'big') {
        return 1;
      }
      if (group1.type === 'small') {
        return 1;
      }
      if (group2.type === 'small') {
        return -1;
      }
    }
    if (group1.number !== group2.number) {
      return group1.number - group2.number;
    }
    return id1 - id2;
  });

const sortTimeBlocksByStart = timeBlocks =>
  timeBlocks.sort(({ start: s1 }, { start: s2 }) => timeToMinutes(s1) - timeToMinutes(s2));

const getTimeBlockColSpan = (timeBlock, colIndex, group) => {
  let colSpan = 1; // Multiplicador de l'amplada relativa del
  // bloc

  // A partir de la següent columna, es busca si el bloc
  // col·lisiona amb alguna de les restants. Mentre no
  // ho faci, significa que el bloc pot pot ocupar-ne
  // l'espai corresponent i s'incrementa el multiplicador.
  // En canvi, quan es detecta una col·lisió, significa
  // que ja té l'amplada màxima que pot tenir
  for (const col of group.slice(colIndex + 1)) {
    if (col.some(timeBlock2 => collide(timeBlock, timeBlock2))) {
      break;
    }
    colSpan++;
  }

  return colSpan;
};

const isGeneric = ({ subject }) => !subject;

const getTimeBlockLeft = (colIndex, timeBlockGroup) => (colIndex / timeBlockGroup.length) * 100;

const getTimeBlockWidth = (timeBlock, colIndex, timeBlockGroup) =>
  (getTimeBlockColSpan(timeBlock, colIndex, timeBlockGroup) / timeBlockGroup.length) * 100;

const getStylingGetters = (groupType = 'generic') => ({
  getColor: el => {
    const { timeBlockColorNames: colorNames, timeBlockColorTones: colorTones } = useConstants();
    return `${colorNames[groupType]}-${colorTones[el]}`;
  },
  getFontSize: el => {
    const { timeBlockFontSizes: fontSizes } = useConstants();
    return fontSizes[el];
  }
});

export default () => ({
  calcIntervalStart,
  calcIntervalCount,
  getHr,
  getMin,
  timeToMinutes,
  minutesToTime,
  getEndMinutes,
  getEndTime,
  getDuration,
  getNearestIntervalTime,
  getMinPlaceableTime,
  getMaxPlaceableTime,
  getDurationMaxMinutes,
  isValidDurationMinutes,
  isValidDurationTime,
  clampMinutes,
  timeElemsCollide,
  collide,
  layoutTimeBlocks,
  sortTimeBlocks,
  sortTimeBlocksByStart,
  getTimeBlockColSpan,
  isGeneric,
  getTimeBlockLeft,
  getTimeBlockWidth,
  getStylingGetters
});
