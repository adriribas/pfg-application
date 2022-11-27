<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useScheduleDragAndDrop, useTimeBlockPlacing } from '@/composables';
import { timeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import TimeBlocksSection from '@/components/schedule/studies/modification/TimeBlocksSection.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { groupTypeLabels, courseLabels, semesterLabels, timeBlockDragStartAnimation } = useConstants();
const { minutesToTime, sortTimeBlocks, getStylingGetters } = useCalendar();
const { text, bg, px, percent, pt, stop, prevent, stopPrevent } = useGeneral();

const {
  placedTimeBlocks,
  unplacedTimeBlocks,
  placing,
  moving,
  dragging,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDropCalendar,
  onDropUnplacedZone
} = useScheduleDragAndDrop(props.timeBlocks.placed, props.timeBlocks.unplaced);
const { refreshPlacedTimeBlocks, getPlaced, getUnplaced, findPlaced } = useTimeBlockPlacing(
  placedTimeBlocks,
  unplacedTimeBlocks
);

const splitterWidth = ref(75);

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

const openTimeBlockModification = () => {};
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
          :time-blocks="placedTimeBlocks"
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
              :enable-resizers="true"
              draggable="true"
              @press="openTimeBlockModification"
              @resize="resizeData => onResize(weekDay, props.timeBlock.id, resizeData)"
              @dragstart="onDragStart($event, props.timeBlock.id, weekDay, 'move')"
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
          <q-expansion-item group="main" icon="settings" label="Opcions"> </q-expansion-item>

          <q-expansion-item group="main" icon="join_left" label="Solapaments"> </q-expansion-item>

          <q-expansion-item group="main" default-opened icon="dashboard" label="Blocs horaris">
            <TimeBlocksSection
              :subjects="subjects"
              :dragging="dragging"
              :get-placed="getPlaced"
              :get-unplaced="getUnplaced"
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
</style>

<style lang="sass">
.droppable
  background: $g8
  opacity: 0.6
  z-index: 1
</style>
