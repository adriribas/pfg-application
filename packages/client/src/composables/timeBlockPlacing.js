import { useCalendar } from '@/util';

export default (placedTimeBlocks, unplacedTimeBlocks) => {
  const refreshPlacedTimeBlocks = () => (placedTimeBlocks.value = [...placedTimeBlocks.value]);

  const getSubjectPlaced = subjectCode =>
    placedTimeBlocks.value.reduce(
      (accum, weekDayTimeBlocks) => [
        ...accum,
        ...weekDayTimeBlocks.filter(({ subject }) => subject?.code === subjectCode)
      ],
      []
    );
  const getGenericPlaced = () => {
    const { isGeneric } = useCalendar();

    return placedTimeBlocks.value.reduce(
      (accum, weekDayTimeBlocks) => [...accum, ...weekDayTimeBlocks.filter(isGeneric)],
      []
    );
  };
  const findPlaced = (weekDay, id) => {
    const index = placedTimeBlocks.value[weekDay].findIndex(timeBlock => timeBlock.id === id);

    return {
      index,
      timeBlock: placedTimeBlocks.value[weekDay][index]
    };
  };
  const addToPlaced = (timeBlock, weekDay, start, week) =>
    placedTimeBlocks.value[weekDay].push({
      ...timeBlock,
      start,
      week: week === 'general' ? null : week
    });
  const removeFromPlaced = (weekDay, index) => placedTimeBlocks.value[weekDay].splice(index, 1);

  const getSubjectUnplaced = subjectCode =>
    unplacedTimeBlocks.value.filter(({ subject }) => subject?.code === subjectCode);
  const getGenericUnplaced = () => {
    const { isGeneric } = useCalendar();

    return unplacedTimeBlocks.value.filter(isGeneric);
  };
  const findUnplaced = id => {
    const index = unplacedTimeBlocks.value.findIndex(timeBlock => timeBlock.id === id);

    return {
      index,
      timeBlock: unplacedTimeBlocks.value[index]
    };
  };
  const addToUnplaced = timeBlock => unplacedTimeBlocks.value.push({ ...timeBlock, start: null, week: null });
  const removeFromUnplaced = index => unplacedTimeBlocks.value.splice(index, 1);

  const findTimeBlock = id => {
    const unplaced = findUnplaced(id);
    if (unplaced.index !== -1) {
      return unplaced;
    }

    for (let i = 0; i < 5; i++) {
      const placed = findPlaced(i, id);
      if (placed.index !== -1) {
        return { ...placed, weekDay: i };
      }
    }
  };

  const doPlace = (id, weekDay, start, week) => {
    const { index, timeBlock } = findUnplaced(id);

    removeFromUnplaced(index);
    addToPlaced(timeBlock, weekDay, start, week);
    refreshPlacedTimeBlocks();
  };

  const doUnplace = (id, weekDay) => {
    const { index, timeBlock } = findPlaced(weekDay, id);

    removeFromPlaced(weekDay, index);
    refreshPlacedTimeBlocks();
    addToUnplaced(timeBlock);

    return { start: timeBlock.start, week: timeBlock.week };
  };

  const doMove = (id, currentWeekDay, weekDay, start, week) => {
    const { index, timeBlock } = findPlaced(currentWeekDay, id);

    removeFromPlaced(currentWeekDay, index);
    addToPlaced(timeBlock, weekDay, start, week);
    refreshPlacedTimeBlocks();

    return { start: timeBlock.start, week: timeBlock.week };
  };

  return {
    refreshPlacedTimeBlocks,
    getSubjectPlaced,
    getGenericPlaced,
    findPlaced,
    addToPlaced,
    removeFromPlaced,
    getSubjectUnplaced,
    getGenericUnplaced,
    findUnplaced,
    addToUnplaced,
    removeFromUnplaced,
    findTimeBlock,
    doPlace,
    doUnplace,
    doMove
  };
};
