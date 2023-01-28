import { computed } from 'vue';
import { useTimeBlocksStore, useOverlappingStore, useScheduleSettingsStore } from '@/stores';
import { useCalendar } from '@/util';

export default (timeBlock, day) => {
  const timeBlocksStore = useTimeBlocksStore();
  const overlappingStore = useOverlappingStore();
  const scheduleSettingsStore = useScheduleSettingsStore();
  const { getEndTime, isGeneric, collide } = useCalendar();

  const notGeneric = !isGeneric(timeBlock.value);

  const timeBlocksOverlapping = computed(
    () =>
      notGeneric &&
      timeBlocksStore
        .dayPlaced(day.value)
        .filter(
          tb =>
            !isGeneric(tb) &&
            (!tb.week || !timeBlock.value.week || tb.week === timeBlock.value.week) &&
            collide(tb, timeBlock.value) &&
            tb.group.id === timeBlock.value.group.id &&
            tb.id !== timeBlock.value.id
        )
  );
  const hasTimeBlocksOverlapping = computed(() => !!timeBlocksOverlapping.value.length);

  const labTypesOverlapping = computed(
    () =>
      notGeneric &&
      timeBlock.value.subject.labTypes.map(({ name }) => ({
        name,
        studies: overlappingStore.overlapsWith(
          timeBlock.value.week || 'general',
          day.value,
          timeBlock.value.start,
          getEndTime(timeBlock.value.start, timeBlock.value.duration),
          name
        )
      }))
  );
  const hasLabTypesOverlapping = computed(
    () =>
      notGeneric &&
      timeBlock.value.group.type === 'small' &&
      labTypesOverlapping.value.some(({ studies }) => studies.length)
  );

  const professorOverlapping = computed(() => []);
  const hasProfessorOverlapping = computed(() => !!professorOverlapping.value.length);

  const roomOverlapping = computed(() => []);
  const hasRoomOverlapping = computed(() => !!roomOverlapping.value.length);

  const isOverlapped = computed(
    () =>
      (scheduleSettingsStore.check.timeBlocksOverlapping && hasTimeBlocksOverlapping.value) ||
      (scheduleSettingsStore.check.labTypesOverlapping && hasLabTypesOverlapping.value) ||
      (scheduleSettingsStore.check.professorsOverlapping && hasProfessorOverlapping.value) ||
      (scheduleSettingsStore.check.roomsOverlapping && hasRoomOverlapping.value)
  );

  return {
    timeBlocksOverlapping,
    hasTimeBlocksOverlapping,
    labTypesOverlapping,
    hasLabTypesOverlapping,
    professorOverlapping,
    hasProfessorOverlapping,
    roomOverlapping,
    hasRoomOverlapping,
    isOverlapped
  };
};
