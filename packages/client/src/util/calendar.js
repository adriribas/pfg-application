import _ from 'lodash';

import { useConstants } from '.';

const calcIntervalStart = (startHour, minutes) => startHour * (60 / minutes);

const calcIntervalCount = (startHour, endHour, minutes) => (60 / minutes) * (endHour - startHour);

const timeToMinutes = timeString => +timeString.substring(0, 2) * 60 + +timeString.substring(3, 5);

const padStartZero = value => `${value > 9 ? '' : '0'}${value}`;

const minutesToTime = minutes => `${padStartZero(Math.trunc(minutes / 60))}:${padStartZero(minutes % 60)}`;

const collide = (timeBlock1, timeBlock2) => {
  const tb1 = { start: timeToMinutes(timeBlock1.start), duration: timeBlock1.duration };
  const tb2 = { start: timeToMinutes(timeBlock2.start), duration: timeBlock2.duration };

  let first = tb1;
  let second = tb2;
  if (second.start < first.start) {
    first = tb2;
    second = tb1;
  }

  return _.inRange(second.start, first.start, first.start + first.duration);
};

const updateCollisions = timeBlocks =>
  timeBlocks.forEach((timeBlock, index) => {
    const candidateCollisions = timeBlocks.reduce(
      (accum, timeBlock2, cIndex) =>
        cIndex !== index && collide(timeBlock, timeBlock2) ? [...accum, cIndex] : accum,
      []
    );

    timeBlock.collisions = candidateCollisions
      .filter(
        (cIndex, index) =>
          !candidateCollisions
            .slice(index + 1)
            .some(cIndex2 => collide(timeBlocks[cIndex], timeBlocks[cIndex2]))
      )
      .sort((cIndex1, cIndex2) => cIndex1 - cIndex2);
  });

const getPositionInAgrupation = (index, collisions) => {
  const position = collisions.findIndex(cIndex => index < cIndex);

  return position > -1 ? position : collisions.length;
};

const getStylingGetters = groupType => ({
  getColor: el => {
    const { scheduleTimeBlockColorNames: colorNames, scheduleTimeBlockColorTones: colorSizes } =
      useConstants();
    return `${colorNames[groupType]}-${colorSizes[el]}`;
  },
  getFontSize: el => {
    const { scheduleTimeBlockFontSizes: fontSizes } = useConstants();
    return fontSizes[el];
  }
});

export default () => ({
  calcIntervalStart,
  calcIntervalCount,
  timeToMinutes,
  minutesToTime,
  collide,
  updateCollisions,
  getPositionInAgrupation,
  getStylingGetters
});
