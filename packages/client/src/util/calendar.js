import _ from 'lodash';

import { useConstants } from '.';

const calcIntervalStart = (startHour, minutes) => startHour * (60 / minutes);

const calcIntervalCount = (startHour, endHour, minutes) => (60 / minutes) * (endHour - startHour);

const timeToMinutes = timeString => +timeString.substring(0, 2) * 60 + +timeString.substring(3, 5);

const padStartZero = value => `${value > 9 ? '' : '0'}${value}`;

const minutesToTime = minutes => `${padStartZero(Math.trunc(minutes / 60))}:${padStartZero(minutes % 60)}`;

const getEndMinutes = (startTime, duration) => timeToMinutes(startTime) + duration;

const getEndTime = (startTime, duration) => minutesToTime(getEndMinutes(startTime, duration));

const collide = (timeBlock1, timeBlock2) =>
  getEndTime(timeBlock1.start, timeBlock1.duration) > timeBlock2.start &&
  timeBlock1.start < getEndTime(timeBlock2.start, timeBlock2.duration);

const layoutTimeBlocks = timeBlocks => {
  const groups = [];
  let columns = [];
  let lastTimeBlockEndMinutes = 0;

  timeBlocks
    .sort((tb1, tb2) => {
      const startDiff = timeToMinutes(tb1.start) - timeToMinutes(tb2.start);

      if (startDiff !== 0) {
        return startDiff;
      }

      return getEndMinutes(tb1.start, tb1.duration) - getEndMinutes(tb2.start, tb2.duration);
    })
    .forEach(timeBlock => {
      if (lastTimeBlockEndMinutes && timeToMinutes(timeBlock.start) > lastTimeBlockEndMinutes) {
        groups.push(columns);
        columns = [];
        lastTimeBlockEndMinutes = 0;
      }

      const col = columns.find(col => !collide(col.at(-1), timeBlock));
      if (col) {
        col.push(timeBlock);
      } else {
        columns.push([timeBlock]);
      }

      const endMinutes = getEndMinutes(timeBlock.start, timeBlock.duration);
      if (lastTimeBlockEndMinutes <= endMinutes) {
        lastTimeBlockEndMinutes = endMinutes;
      }
    });

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

const getTimeBlockColSpan = (timeBlock, colIndex, cols) => {
  let colSpan = 1;

  for (const col of cols.slice(colIndex + 1)) {
    if (col.some(timeBlock2 => collide(timeBlock, timeBlock2))) {
      break;
    }
    colSpan++;
  }

  return colSpan;
};

const getStylingGetters = groupType => ({
  getColor: el => {
    const { timeBlockColorNames: colorNames, timeBlockColorTones: colorSizes } = useConstants();
    return `${colorNames[groupType]}-${colorSizes[el]}`;
  },
  getFontSize: el => {
    const { timeBlockFontSizes: fontSizes } = useConstants();
    return fontSizes[el];
  }
});

export default () => ({
  calcIntervalStart,
  calcIntervalCount,
  timeToMinutes,
  minutesToTime,
  getEndMinutes,
  getEndTime,
  collide,
  layoutTimeBlocks,
  sortTimeBlocks,
  getTimeBlockColSpan,
  getStylingGetters
});
