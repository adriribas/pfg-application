<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useTimeBlocksStore, useOverlappingStore, useScheduleSettingsStore } from '@/stores';
import { useScheduleDragAndDrop } from '@/composables';
import { groupsApi, timeBlocksApi, genericTimeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import TimeBlocksSection from '@/components/schedule/studies/modification/TimeBlocksSection.vue';
import SettingsSection from '@/components/schedule/studies/modification/SettingsSection.vue';
import OverlappingMarker from '@/components/schedule/studies/modification/OverlappingMarker.vue';
import TimeBlockModificationDialog from '@/components/dialogs/TimeBlockModificationDialog.vue';
import GenericTimeBlockModificationDialog from '@/components/dialogs/GenericTimeBlockModificationDialog.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array
});

const $q = useQuasar();
const timeBlocksStore = useTimeBlocksStore();
const overLappingStore = useOverlappingStore();
const scheduleSettingsStore = useScheduleSettingsStore();
const {
  moving,
  dragging,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDropCalendar,
  onDropUnplacedZone
} = useScheduleDragAndDrop();
const { courseLabels, semesterLabels, groupTypeLabels } = useConstants();
const { getEndTime, isGeneric, getStylingGetters } = useCalendar();
const {} = useGeneral();

const splitterWidth = ref(75);

/* const toggleStudyFilter = ref(true);
const toggleAssignationFilter = ref(false);
const showTimeBlocksOverlapping = ref(true);
const showLabTypesOverlapping = ref(true);
const showProfessorsOverlapping = ref(true);
const showRoomsOverlapping = ref(true); */

const isShared = ({ sharedBy }) => sharedBy.length > 1;

const filters = computed(() => {
  const filters = [];

  scheduleSettingsStore.toggle.assignationFilter &&
    filters.push(({ subject, group: { studies } }) => !isShared(subject) || studies.length);
  scheduleSettingsStore.toggle.studyFilter &&
    filters.push(
      ({ subject, group: { studies } }) =>
        !isShared(subject) || !studies.length || studies.some(({ abv }) => abv === props.study.abv)
    );

  return filters;
});

const applyFilters = timeBlock => isGeneric(timeBlock) || filters.value.every(filter => filter(timeBlock));

const breadcrumbsData = [
  {
    icon: 'edit_calendar',
    to: 'studyScheduleChoosing',
    color: 'm6'
  },
  { icon: 'school', label: props.study.abv },
  { label: courseLabels[props.course - 1] },
  { label: `${semesterLabels[props.semester - 1]} Q` }
];

const timeBlocksOverlappingStripes = computed(() => {
  if (!dragging.value || isGeneric(dragging.value)) {
    return () => [];
  }

  const {
    id: timeBlockId,
    group: { id: groupId }
  } = dragging.value;

  return day =>
    timeBlocksStore.filteredPlaced(
      timeBlock => !isGeneric(timeBlock) && timeBlock.group.id === groupId && timeBlock.id !== timeBlockId
    )[day];
});
const overlappingMarkers = computed(() => day => {
  const markers = [];

  scheduleSettingsStore.check.timeBlocksOverlapping &&
    markers.push(...timeBlocksOverlappingStripes.value(day));
  scheduleSettingsStore.check.labTypesOverlapping &&
    markers.push(...overLappingStore.overlappingStripes(day));
  scheduleSettingsStore.check.professorsOverlapping && markers.push(...[]);
  scheduleSettingsStore.check.roomsOverlapping && markers.push(...[]);

  return markers;
});

const onResize = async (weekDay, id, { start, duration }) => {
  const { timeBlock } = timeBlocksStore.findPlaced(weekDay, id);
  const currentStart = timeBlock.start;
  const currentDuration = timeBlock.duration;
  const updateData = { duration };

  timeBlock.duration = duration;
  if (start) {
    timeBlock.start = start;
    updateData.start = start;
  }
  timeBlocksStore.refreshPlaced();
  try {
    await timeBlocksApi.update(id, updateData);
  } catch (e) {
    timeBlock.start = currentStart;
    timeBlock.duration = currentDuration;
    timeBlocksStore.refreshPlaced();
  }
};

const createTimeBlocks = ({ subjectCode, id: groupId, amount }) => {
  const subject = props.subjects.find(({ code }) => code === subjectCode);
  if (!subject) {
    return;
  }
  const group = subject.groups.find(({ id }) => id === groupId);
  if (!group) {
    return;
  }
  const creationPromises = [];
  for (let i = 0; i < amount; i++) {
    creationPromises.push(
      new Promise(async (res, rej) => {
        try {
          const { data: timeBlock } = await timeBlocksApi.create({ group: groupId });
          $q.notify({
            type: 'success',
            message: 'Bloc horari creat correctament',
            caption: `${subject.name} - Grup ${groupTypeLabels[group.type]} ${group.number}`,
            color: getStylingGetters(group.type).getColor('successNotif')
          });
          res({ ...timeBlock, subject, group });
        } catch (e) {
          $q.notify({
            type: 'error',
            message: `Error en la creació del bloc horari (${subject.name} - Grup ${
              groupTypeLabels[group.type]
            })`,
            caption: e.message
          });
          rej(e);
        }
      })
    );
  }
  return creationPromises;
};
const removeTimeBlocks = timeBlockIds =>
  timeBlockIds.map(async id => {
    const { timeBlock } = timeBlocksStore.findTimeBlock(id);
    try {
      await timeBlocksApi.remove(id);
      $q.notify({
        type: 'success',
        message: 'Bloc horari esborrat correctament',
        caption: `${timeBlock.subject.name} - Grup ${groupTypeLabels[timeBlock.group.type]} ${
          timeBlock.group.number
        }`,
        color: getStylingGetters(timeBlock.group.type).getColor('successNotif')
      });
      return id;
    } catch (e) {
      $q.notify({
        type: 'error',
        message: `Error en l'eliminació del bloc horari (${timeBlock.subject.name} - Grup ${
          groupTypeLabels[timeBlock.group.type]
        })`,
        caption: e.message
      });
    }
  });
const modifyTimeBlocksSync = async (toCreate, toRemove) => {
  const createdTimeBlocks = toCreate.map(createTimeBlocks);
  const removedTimeBlocks = removeTimeBlocks(toRemove);

  for (const newGroupTimeBlocks of createdTimeBlocks) {
    for (const promise of newGroupTimeBlocks) {
      try {
        timeBlocksStore.addToUnplaced(await promise);
      } catch ({}) {}
    }
  }
  for (const promise of removedTimeBlocks) {
    try {
      const { index, weekDay } = timeBlocksStore.findTimeBlock(await promise);
      if (weekDay === -1) {
        timeBlocksStore.removeFromUnplaced(index);
      } else {
        timeBlocksStore.removeFromPlaced(weekDay, index);
      }
    } catch ({}) {}
  }

  timeBlocksStore.refreshPlaced();
};

const createGenericTimeBlocks = toCreateTimeBlocksData =>
  toCreateTimeBlocksData.map(async data => {
    try {
      const { data: timeBlock } = await genericTimeBlocksApi.create({
        study: props.study.abv,
        course: props.course,
        semester: props.semester,
        ...data
      });
      $q.notify({
        type: 'success',
        message: 'Bloc horari genèric creat correctament',
        caption: `${data.label} - ${data.subLabel}`,
        color: getStylingGetters('generic').getColor('successNotif')
      });
      return timeBlock;
    } catch (e) {
      console.error(e);
      $q.notify({
        type: 'error',
        message: `Error en la creació del bloc horari genèric (${data.label} - ${data.subLabel})`,
        caption: e.message
      });
    }
  });

const updateGenericTimeBlocks = toUpdateTimeBlocksData =>
  toUpdateTimeBlocksData.map(async ({ id, label, subLabel, start, duration }) => {
    const { timeBlock } = start ? timeBlocksStore.findPlaced(weekDay, id) : timeBlocksStore.findUnplaced(id);
    try {
      const { data: updatedTimeBlock } = await genericTimeBlocksApi.update(id, { label, subLabel, duration });
      $q.notify({
        type: 'success',
        message: 'Bloc horari genèric modificat correctament',
        caption: `${label} - ${subLabel}`,
        color: getStylingGetters('generic').getColor('successNotif')
      });
      return { id, ...updatedTimeBlock };
    } catch (e) {
      $q.notify({
        type: 'error',
        message: `Error en la modificació del bloc horari genèric (${timeBlock.label} - ${timeBlock.subLabel})`,
        caption: e.message
      });
    }
  });
const removeGenericTimeBlocks = timeBlockIds =>
  timeBlockIds.map(async id => {
    const { timeBlock } = timeBlocksStore.findTimeBlock(id);
    try {
      await genericTimeBlocksApi.remove(id);
      $q.notify({
        type: 'success',
        message: 'Bloc horari genèric esborrat correctament',
        caption: `${timeBlock.label} - ${timeBlock.subLabel}`,
        color: getStylingGetters('generic').getColor('successNotif')
      });
      return id;
    } catch (e) {
      $q.notify({
        type: 'error',
        message: `Error en l'eliminació del bloc horari genèric (${timeBlock.label} - ${timeBlock.subLabel})`,
        caption: e.message
      });
    }
  });
const modifyGenericTimeBlocksSync = async (toCreate, toUpdate, toRemove) => {
  const createdTimeBlocks = createGenericTimeBlocks(toCreate);
  const updatedTimeBlocks = updateGenericTimeBlocks(toUpdate);
  const removedTimeBlocks = removeGenericTimeBlocks(toRemove);

  for (const promise of createdTimeBlocks) {
    try {
      timeBlocksStore.addToUnplaced(
        _.pick(await promise, ['id', 'label', 'labelAbv', 'subLabel', 'day', 'start', 'duration', 'week'])
      );
    } catch ({}) {}
  }
  for (const promise of updatedTimeBlocks) {
    try {
      const { id, label, labelAbv, subLabel, duration } = await promise;
      const { timeBlock } = timeBlocksStore.findTimeBlock(id);
      timeBlock.label = label;
      timeBlock.labelAbv = labelAbv;
      timeBlock.subLabel = subLabel;
      timeBlock.duration = duration;
    } catch ({}) {}
  }
  for (const promise of removedTimeBlocks) {
    try {
      const { index, weekDay } = timeBlocksStore.findTimeBlock(await promise);
      if (weekDay === -1) {
        timeBlocksStore.removeFromUnplaced(index);
      } else {
        timeBlocksStore.removeFromPlaced(weekDay, index);
      }
    } catch ({}) {}
  }

  timeBlocksStore.refreshPlaced();
};

const updateWeekDay = (id, currentWeekDay, newWeekDay, start, week) => {
  if (currentWeekDay === newWeekDay) {
    if (currentWeekDay !== -1) {
      timeBlocksStore.refreshPlaced();
    }
    return;
  }

  if (newWeekDay === -1) {
    timeBlocksStore.unplace(id, currentWeekDay);
  } else if (currentWeekDay === -1) {
    timeBlocksStore.place(id, newWeekDay, start, week);
  } else {
    timeBlocksStore.move(id, currentWeekDay, newWeekDay, start, week);
  }
};

const updateTimeBlock = async (id, weekDay, { sharedBy: modSharedBy, ...modTimeData }, timeData) => {
  const { timeBlock } = timeData.start
    ? timeBlocksStore.findPlaced(weekDay, id)
    : timeBlocksStore.findUnplaced(id);

  timeBlock.start = modTimeData.start;
  timeBlock.duration = modTimeData.duration;
  timeBlock.week = modTimeData.week;
  updateWeekDay(id, weekDay, modTimeData.day, modTimeData.start, modTimeData.week);

  await groupsApi.update(timeBlock.group.id, { studies: modSharedBy.map(({ abv }) => abv) });
  timeBlock.group.studies = modSharedBy;
  try {
    await timeBlocksApi.update(id, { ...modTimeData, day: modTimeData.day === -1 ? null : modTimeData.day });
  } catch (e) {
    timeBlock.start = timeData.start;
    timeBlock.duration = timeData.duration;
    timeBlock.week = timeData.week;
    updateWeekDay(id, modTimeData.day, weekDay, timeData.start, timeData.week);
    throw e;
  }
};
const updateGenericTimeBlock = async (id, weekDay, modData, timeData) => {
  const { timeBlock } = timeData.start
    ? timeBlocksStore.findPlaced(weekDay, id)
    : timeBlocksStore.findUnplaced(id);

  timeBlock.start = modData.start;
  timeBlock.duration = modData.duration;
  timeBlock.week = modData.week;
  timeBlock.label = modData.label;
  timeBlock.subLabel = modData.subLabel;
  updateWeekDay(id, weekDay, modData.day, modData.start, modData.week);

  try {
    await genericTimeBlocksApi.update(id, {
      ...modData,
      day: modData.day === -1 ? null : modData.day
    });
  } catch (e) {
    timeBlock.start = timeData.start;
    timeBlock.duration = timeData.duration;
    timeBlock.week = timeData.week;
    timeBlock.label = timeData.label;
    timeBlock.subLabel = timeData.subLabel;
    updateWeekDay(id, modData.day, weekDay, modData.start, modData.week);
    throw e;
  }
};

const openModification = ({ timeBlock, labTypesOverlapping, weekDay, getColor, getFontSize }) => {
  const { start, duration, week } = timeBlock;
  const commonProps = {
    day: weekDay,
    start,
    end: start && getEndTime(start, duration),
    duration,
    week,
    getColor,
    getFontSize
  };

  if (isGeneric(timeBlock)) {
    const { label, subLabel } = timeBlock;
    $q.dialog({
      component: GenericTimeBlockModificationDialog,
      componentProps: { label, subLabel, ...commonProps }
    }).onOk(async modData => {
      try {
        await updateGenericTimeBlock(timeBlock.id, weekDay, modData, { start, duration, week });
        $q.notify({
          type: 'success',
          message: 'Bloc horari genèric modificat correctament',
          caption: `${modData.label} - ${modData.subLabel}`,
          color: getColor('successNotif')
        });
      } catch (e) {
        console.error(e);
        $q.notify({
          type: 'error',
          message: 'Error en la modificació del bloc horari genèric',
          caption: e.message
        });
      }
    });
  } else {
    const { group, subject, roomType, professor } = timeBlock;
    $q.dialog({
      component: TimeBlockModificationDialog,
      componentProps: { labTypesOverlapping, group, subject, roomType, professor, ...commonProps }
    }).onOk(async modData => {
      try {
        await updateTimeBlock(timeBlock.id, weekDay, modData, { start, duration, week });
        $q.notify({
          type: 'success',
          message: 'Bloc horari modificat correctament',
          caption: `${subject.name} - Grup ${groupTypeLabels[group.type]} ${group.number}`,
          color: getColor('successNotif')
        });
      } catch (e) {
        console.error(e);
        $q.notify({
          type: 'error',
          message: 'Error en la modificació del bloc horari',
          caption: e.message
        });
      }
    });
  }
};
</script>

<template>
  <q-splitter
    v-model="splitterWidth"
    :limits="[75, 85]"
    unit="%"
    dark
    before-class="border-10 shadow-5 bg-b8"
    separator-class="q-mx-xs q-my-md bg-m10"
    after-class="border-10 shadow-5 bg-b8">
    <template #before>
      <div class="height-definer">
        <Schedule
          :time-blocks="timeBlocksStore.filteredPlaced(applyFilters)"
          :drag-enter="onDragEnter"
          :drag-over="onDragOver"
          :drag-leave="onDragLeave"
          :drop="onDropCalendar"
          :intervals-front="!!dragging">
          <template #breadcrumbs>
            <Breadcrumbs :elements="breadcrumbsData" />
          </template>

          <template #time-block="{ weekDay, props }">
            <TimeBlock
              :="props"
              :day="weekDay"
              enable-resizers
              draggable="true"
              @press="data => openModification({ weekDay, ...data })"
              @resize="resizeData => onResize(weekDay, props.timeBlock.id, resizeData)"
              @dragstart="onDragStart($event, props.timeBlock, isGeneric(props.timeBlock), weekDay, 'move')"
              @dragend="onDragEnd"
              @dragover.stop />
          </template>

          <template #overlapping="{ day, timeStartPos, timeDurationHeight }">
            <OverlappingMarker
              v-for="{ start, duration } in overlappingMarkers(day)"
              :top="timeStartPos(start)"
              :height="timeDurationHeight(duration)" />
          </template>
        </Schedule>
      </div>
    </template>

    <template #separator>
      <q-avatar icon="drag_indicator" size="20px" color="m8" text-color="white" />
    </template>

    <template #after>
      <div class="height-definer">
        <q-list dark class="q-pb-sm">
          <q-expansion-item
            group="main"
            icon="settings"
            label="Configuració"
            header-class="text-m2"
            expand-icon-class="text-m2">
            <SettingsSection
              :subjects="subjects"
              :study="study"
              @modify-time-blocks="modifyTimeBlocksSync"
              @modify-generic-time-blocks="modifyGenericTimeBlocksSync" />
          </q-expansion-item>

          <q-expansion-item
            group="main"
            default-opened
            icon="dashboard"
            label="Blocs horaris"
            header-class="text-m2"
            expand-icon-class="text-m2"
            class="q-mt-md">
            <TimeBlocksSection
              :subjects="subjects"
              :dragging="!!dragging"
              :filter="applyFilters"
              @drag-start="onDragStart"
              @drag-end="onDragEnd"
              @drop="onDropUnplacedZone"
              @press="openModification" />
          </q-expansion-item>
        </q-list>
      </div>
    </template>
  </q-splitter>
</template>

<style lang="sass" scoped>
.height-definer
  min-height: 500px
  height: calc(100vh - 96px)
.filter-option
  font-size: 10pt
</style>

<style lang="sass">
.droppable
  background: $g8
  opacity: 0.6
  z-index: 1
</style>
