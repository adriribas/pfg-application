<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useScheduleDragAndDrop, useTimeBlockPlacing } from '@/composables';
import { groupsApi, timeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import TimeBlocksSection from '@/components/schedule/studies/modification/TimeBlocksSection.vue';
import SettingsSection from '@/components/schedule/studies/modification/SettingsSection.vue';
import TimeBlockModificationDialog from '@/components/dialogs/TimeBlockModificationDialog.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { courseLabels, semesterLabels, groupTypeLabels } = useConstants();
const { getEndTime } = useCalendar();
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
const applyFilters = timeBlock => filters.value.every(filter => filter(timeBlock));
const filteredPlacedTimeBlocks = computed(() =>
  placedTimeBlocks.value.map(weekDayTimeBlocks => weekDayTimeBlocks.filter(applyFilters))
);
//const filteredUnplacedTimeBlocks = computed(() => unplacedTimeBlocks.value.filter(applyFilters));

const { refreshPlacedTimeBlocks, getPlaced, getUnplaced, findPlaced, findUnplaced } = useTimeBlockPlacing(
  placedTimeBlocks,
  unplacedTimeBlocks
);
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
    await timeBlocksApi.update(id, { duration, ...(start ? { start } : {}) });
  } catch (e) {
    timeBlock.start = currentStart;
    timeBlock.duration = currentDuration;
    refreshPlacedTimeBlocks();
  }
};
const openTimeBlockModification = ({
  timeBlock: { id, start, duration, week, group, subject },
  weekDay,
  getColor,
  getFontSize
}) =>
  $q
    .dialog({
      component: TimeBlockModificationDialog,
      componentProps: {
        start,
        end: start ? getEndTime(start, duration) : null,
        duration,
        week,
        group,
        subject,
        getColor,
        getFontSize
      }
    })
    .onOk(async ({ sharedBy, ...timeBlockData }) => {
      const { timeBlock } = start ? findPlaced(weekDay, id) : findUnplaced(id);

      timeBlock.start = timeBlockData.start;
      timeBlock.duration = timeBlockData.duration;
      timeBlock.week = timeBlockData.week;
      refreshPlacedTimeBlocks();

      try {
        await groupsApi.update(group.id, { studies: sharedBy.map(({ abv }) => abv) });
        timeBlock.group.studies = sharedBy;
        try {
          await timeBlocksApi.update(id, timeBlockData);
          $q.notify({
            type: 'success',
            message: 'Bloc horari modificat correctament',
            caption: `${subject.name} - Grup ${groupTypeLabels[group.type]} ${group.number}`,
            color: getColor('successNotif')
          });
        } catch (e) {
          timeBlock.start = start;
          timeBlock.duration = duration;
          timeBlock.week = week;
          refreshPlacedTimeBlocks();
          throw e;
        }
      } catch (e) {
        console.error(e);
        $q.notify({
          type: 'error',
          message: 'Error en la modificació del bloc horari',
          caption: e.message
        });
      }
    });
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
              @press="data => openTimeBlockModification({ weekDay, ...data })"
              @resize="resizeData => onResize(weekDay, props.timeBlock.id, resizeData)"
              @dragstart="onDragStart($event, props.timeBlock.id, weekDay, props.timeBlock.duration, 'move')"
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
              :get-unplaced-time-blocks="() => unplacedTimeBlocks" />
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
              :get-placed="subjectCode => getPlaced(subjectCode).filter(applyFilters)"
              :get-unplaced="subjectCode => getUnplaced(subjectCode).filter(applyFilters)"
              @drag-start="onDragStart"
              @drag-end="onDragEnd"
              @drop="onDropUnplacedZone"
              @press="openTimeBlockModification" />
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
