<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useScheduleDragAndDrop, useTimeBlockPlacing } from '@/composables';
import { groupsApi, timeBlocksApi, genericTimeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import TimeBlocksSection from '@/components/schedule/studies/modification/TimeBlocksSection.vue';
import SettingsSection from '@/components/schedule/studies/modification/SettingsSection.vue';
import TimeBlockModificationDialog from '@/components/dialogs/TimeBlockModificationDialog.vue';
import GenericTimeBlockModificationDialog from '@/components/dialogs/GenericTimeBlockModificationDialog.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { courseLabels, semesterLabels, groupTypeLabels } = useConstants();
const { getEndTime, isGeneric, getStylingGetters } = useCalendar();
const {} = useGeneral();

const splitterWidth = ref(75);
const toggleStudyFilter = ref(true);
const toggleAssignationFilter = ref(false);
const placedTimeBlocks = ref(props.timeBlocks.placed);
const unplacedTimeBlocks = ref(props.timeBlocks.unplaced);

const isShared = ({ sharedBy }) => sharedBy.length > 1;
const filters = computed(() => {
  const filters = [];
  toggleAssignationFilter.value &&
    filters.push(({ subject, group: { studies } }) => !isShared(subject) || studies.length);
  toggleStudyFilter.value &&
    filters.push(
      ({ subject, group: { studies } }) =>
        !isShared(subject) || !studies.length || studies.some(({ abv }) => abv === props.study.abv)
    );
  return filters;
});
const applyFilters = timeBlock => isGeneric(timeBlock) || filters.value.every(filter => filter(timeBlock));
const filteredPlacedTimeBlocks = computed(() =>
  placedTimeBlocks.value.map(weekDayTimeBlocks => weekDayTimeBlocks.filter(applyFilters))
);
//const filteredUnplacedTimeBlocks = computed(() => unplacedTimeBlocks.value.filter(applyFilters));

const {
  refreshPlacedTimeBlocks,
  getSubjectPlaced,
  getGenericPlaced,
  getSubjectUnplaced,
  getGenericUnplaced,
  findPlaced,
  removeFromPlaced,
  findUnplaced,
  addToUnplaced,
  removeFromUnplaced,
  findTimeBlock
} = useTimeBlockPlacing(placedTimeBlocks, unplacedTimeBlocks);
const {
  dragging,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDropCalendar,
  onDropUnplacedZone
} = useScheduleDragAndDrop(placedTimeBlocks, unplacedTimeBlocks);

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

const onResize = async (weekDay, id, { start, duration }) => {
  const { timeBlock } = findPlaced(weekDay, id);
  const currentStart = timeBlock.start;
  const currentDuration = timeBlock.duration;
  const updateData = { duration };

  timeBlock.duration = duration;
  if (start) {
    timeBlock.start = start;
    updateData.start = start;
  }
  refreshPlacedTimeBlocks();
  try {
    await timeBlocksApi.update(id, updateData);
  } catch (e) {
    timeBlock.start = currentStart;
    timeBlock.duration = currentDuration;
    refreshPlacedTimeBlocks();
  }
};

const createGenericTimeBlock = async data => {
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
    addToUnplaced(
      _.pick(timeBlock, ['id', 'label', 'labelAbv', 'subLabel', 'day', 'start', 'duration', 'week'])
    );
  } catch (e) {
    console.error(e);
    $q.notify({
      type: 'error',
      message: `Error en la creació del bloc horari genèric (${data.label} - ${data.subLabel})`,
      caption: e.message
    });
  }
};
const updateGenericTimeBlock2 = async (id, data) => {
  const { timeBlock } = data.start ? findPlaced(weekDay, id) : findUnplaced(id);
  try {
    await genericTimeBlocksApi.update(id, data);
    $q.notify({
      type: 'success',
      message: 'Bloc horari genèric modificat correctament',
      caption: `${data.label} - ${data.subLabel}`,
      color: getStylingGetters('generic').getColor('successNotif')
    });
    timeBlock.label = data.label;
    timeBlock.subLabel = data.subLabel;
    timeBlock.duration = data.duration;
  } catch (e) {
    $q.notify({
      type: 'error',
      message: `Error en la modificació del bloc horari genèric (${timeBlock.label} - ${timeBlock.subLabel})`,
      caption: e.message
    });
  }
};
const removeGenericTimeBlock = async id => {
  const { timeBlock, index, weekDay } = findTimeBlock(id);
  try {
    await genericTimeBlocksApi.remove(id);
    $q.notify({
      type: 'success',
      message: 'Bloc horari genèric esborrat correctament',
      color: getStylingGetters('generic').getColor('successNotif')
    });
    if (weekDay === -1) {
      removeFromUnplaced(index);
    } else {
      removeFromPlaced(weekDay, index);
    }
  } catch (e) {
    $q.notify({
      type: 'error',
      message: `Error en l'eliminació del bloc horari genèric (${timeBlock.label} - ${timeBlock.subLabel})`,
      caption: e.message
    });
  }
};

const updateTimeBlock = async (id, weekDay, { sharedBy: modSharedBy, ...modTimeData }, timeData) => {
  const { timeBlock } = timeData.start ? findPlaced(weekDay, id) : findUnplaced(id);

  timeBlock.start = modTimeData.start;
  timeBlock.duration = modTimeData.duration;
  timeBlock.week = modTimeData.week;
  refreshPlacedTimeBlocks();

  await groupsApi.update(timeBlock.group.id, { studies: modSharedBy.map(({ abv }) => abv) });
  timeBlock.group.studies = modSharedBy;
  try {
    await timeBlocksApi.update(id, modTimeData);
  } catch (e) {
    timeBlock.start = timeData.start;
    timeBlock.duration = timeData.duration;
    timeBlock.week = timeData.week;
    refreshPlacedTimeBlocks();
    throw e;
  }
};
const updateGenericTimeBlock = async (id, weekDay, modData, timeData) => {
  const { timeBlock } = timeData.start ? findPlaced(weekDay, id) : findUnplaced(id);

  timeBlock.start = modData.start;
  timeBlock.duration = modData.duration;
  timeBlock.week = modData.week;
  timeBlock.label = modData.label;
  timeBlock.subLabel = modData.subLabel;
  refreshPlacedTimeBlocks();

  try {
    await genericTimeBlocksApi.update(id, modData);
  } catch (e) {
    timeBlock.start = timeData.start;
    timeBlock.duration = timeData.duration;
    timeBlock.week = timeData.week;
    timeBlock.label = timeData.label;
    timeBlock.subLabel = timeData.subLabel;
    refreshPlacedTimeBlocks();
    throw e;
  }
};

const openModification = ({ timeBlock, weekDay, getColor, getFontSize }) => {
  const { start, duration, week } = timeBlock;
  const commonProps = {
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
      componentProps: { group, subject, roomType, professor, ...commonProps }
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
          :time-blocks="filteredPlacedTimeBlocks"
          :drag-enter="onDragEnter"
          :drag-over="onDragOver"
          :drag-leave="onDragLeave"
          :drop="onDropCalendar"
          :intervals-front="dragging">
          <template #breadcrumbs>
            <Breadcrumbs :elements="breadcrumbsData" />
          </template>

          <template #time-block="{ weekDay, props }">
            <TimeBlock
              :="props"
              enable-resizers
              draggable="true"
              :get-color="
                getStylingGetters(isGeneric(props.timeBlock) ? 'generic' : props.timeBlock.group.type)
                  .getColor
              "
              :get-font-size="getStylingGetters().getFontSize"
              @press="data => openModification({ weekDay, ...data })"
              @resize="resizeData => onResize(weekDay, props.timeBlock.id, resizeData)"
              @dragstart="
                onDragStart(
                  $event,
                  props.timeBlock.id,
                  props.timeBlock.duration,
                  isGeneric(props.timeBlock),
                  weekDay,
                  'move'
                )
              "
              @dragend="onDragEnd"
              @dragover.stop />
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
              v-model:assignation-filter="toggleAssignationFilter"
              v-model:study-filter="toggleStudyFilter"
              :study="study"
              :get-placed-time-blocks="() => placedTimeBlocks"
              :get-unplaced-time-blocks="() => unplacedTimeBlocks"
              @create:generic-time-block="createGenericTimeBlock"
              @update:generic-time-block="updateGenericTimeBlock2"
              @remove:generic-time-block="removeGenericTimeBlock" />
          </q-expansion-item>

          <!-- <q-expansion-item
            group="main"
            icon="join_left"
            label="Solapaments"
            header-class="text-m2"
            expand-icon-class="text-m2"
            class="q-mt-md">
          </q-expansion-item> -->

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
              :dragging="dragging"
              :get-subject-placed="subjectCode => getSubjectPlaced(subjectCode).filter(applyFilters)"
              :get-generic-placed="getGenericPlaced"
              :get-subject-unplaced="subjectCode => getSubjectUnplaced(subjectCode).filter(applyFilters)"
              :get-generic-unplaced="getGenericUnplaced"
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
