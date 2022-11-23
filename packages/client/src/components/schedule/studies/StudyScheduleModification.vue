<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useScheduleDragAndDrop } from '@/composables/index.js';
import { timeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { groupTypeLabels, courseLabels, semesterLabels } = useConstants();
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

const getPlacedTimeBlocks = subjectCode =>
  placedTimeBlocks.value.reduce(
    (accum, weekDayTimeBlocks) => [
      ...accum,
      ...weekDayTimeBlocks.filter(({ subject: { code } }) => code === subjectCode)
    ],
    []
  );
const getUnplacedTimeBlocks = subjectCode =>
  unplacedTimeBlocks.value.filter(({ subject: { code } }) => code === subjectCode);
const getColor = (groupType, color) => getStylingGetters(groupType).getColor(color);
const getFontSize = (groupType, fontSize) => getStylingGetters(groupType).getFontSize(fontSize);
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
              draggable="true"
              @press="openTimeBlockModification"
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
          <q-expansion-item group="main" icon="settings" label="Gestió"> </q-expansion-item>

          <q-expansion-item group="main" icon="join_left" label="Solapaments"> </q-expansion-item>

          <q-expansion-item group="main" default-opened icon="dashboard" label="Blocs horaris">
            <div
              v-if="dragging"
              @dragover.prevent
              @drop.prevent="onDropUnplacedZone"
              class="absolute-full z1 q-mx-sm border-8 bg-g5 unplaced-drop-zone"></div>

            <q-expansion-item
              v-for="subject in subjects"
              :key="subject.code"
              :disable="!getUnplacedTimeBlocks(subject.code).length"
              default-opened
              :header-inset-level="0.15"
              :label-lines="2"
              :content-inset-level="0.75"
              icon="auto_stories"
              :label="subject.name"
              header-class="text-g5"
              expand-icon-class="text-g5"
              class="q-mb-md">
              <template #header>
                <q-item-section avatar>
                  <q-avatar icon="auto_stories" color="transparent" text-color="g5" />
                </q-item-section>

                <q-item-section>
                  <q-item-label :lines="2">{{ subject.name }}</q-item-label>

                  <q-item-label caption :lines="1" class="text-g8">
                    {{ getPlacedTimeBlocks(subject.code).length }} de
                    {{
                      getPlacedTimeBlocks(subject.code).length + getUnplacedTimeBlocks(subject.code).length
                    }}
                    blocs col·locats
                  </q-item-label>
                </q-item-section>
              </template>

              <q-table
                v-if="getUnplacedTimeBlocks(subject.code).length"
                grid
                :rows="sortTimeBlocks(getUnplacedTimeBlocks(subject.code))"
                row-key="id"
                hide-header
                :pagination="{ rowsPerPage: 0 }"
                hide-pagination
                card-container-class="q-gutter-sm">
                <template #item="{ row: { id, duration, group } }">
                  <div
                    draggable="true"
                    @click="openTimeBlockModification"
                    @dragstart="onDragStart($event, id)"
                    @dragend="onDragEnd"
                    @dragover.stop
                    :class="[bg(getColor(group.type, 'bg'))]"
                    class="col-5 q-py-xs border-8 shadow-2 cursor-pointer text-center unplaced-time-block-card"
                    :style="{ fontSize: pt(getFontSize(group.type, 'unplacedGroup')) }">
                    <span class="text-bold"> G{{ groupTypeLabels[group.type][0] }} {{ group.number }} </span>

                    <div class="row no-wrap flex-center">
                      <q-icon name="hourglass_top" size="10pt" class="q-mr-xs" />

                      {{ minutesToTime(duration) }}h
                    </div>
                  </div>
                </template>
              </q-table>
            </q-expansion-item>
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
.unplaced-drop-zone
  opacity: 0.4
</style>
