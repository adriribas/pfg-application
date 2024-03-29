<script setup>
import { ref, computed } from 'vue';

import { useConstants, useCalendar } from '@/util';
import ScheduleWeekSelector from '@/components/schedule/ScheduleWeekSelector.vue';
import ScheduleColorCaption from '@/components/schedule/ScheduleColorCaption.vue';
import '@/css/calendar-variables.sass';

const props = defineProps({
  timeBlocks: Array,
  dragEnter: Function,
  dragOver: Function,
  dragLeave: Function,
  drop: Function,
  intervalsFront: Boolean
});

const {
  weekDays,
  scheduleIntervalStart,
  scheduleIntervalStartTime,
  scheduleIntervalEnd,
  scheduleIntervalEndTime,
  scheduleIntervalMinutes
} = useConstants();
const {
  timeToMinutes,
  minutesToTime,
  calcIntervalStart,
  calcIntervalCount,
  layoutTimeBlocks,
  getTimeBlockLeft,
  getTimeBlockWidth,
  isGeneric,
  getStylingGetters
} = useCalendar();

const calendarRef = ref(null);
const headerWidth = ref(0);
const week = ref('general');

const denseHeader = computed(() => headerWidth.value < 965);

const layoutedTimeBlocks = computed(() =>
  props.timeBlocks.map(dayTimeBlocks =>
    layoutTimeBlocks(
      week.value === 'general'
        ? dayTimeBlocks
        : dayTimeBlocks.filter(timeBlock => !timeBlock.week || timeBlock.week === week.value)
    )
  )
);

const updateHeaderWidth = ({ width }) => (headerWidth.value = width);
</script>

<template>
  <div class="schedule-container">
    <div class="absolute-full q-pa-md">
      <div class="row no-wrap justify-between items-center q-mb-md">
        <slot name="breadcrumbs" />

        <ScheduleColorCaption v-if="headerWidth > 670" :dense="denseHeader" />

        <ScheduleWeekSelector v-model="week" :dense="denseHeader" />

        <q-resize-observer @resize="updateHeaderWidth" />
      </div>

      <q-calendar-day
        ref="calendarRef"
        view="week"
        :weekdays="[1, 2, 3, 4, 5]"
        no-active-date
        no-default-header-btn
        hour24-format
        :interval-start="calcIntervalStart(scheduleIntervalStart, scheduleIntervalMinutes)"
        :interval-count="
          calcIntervalCount(scheduleIntervalStart, scheduleIntervalEnd, scheduleIntervalMinutes)
        "
        :interval-minutes="scheduleIntervalMinutes"
        dark
        animated
        :interval-class="({ scope: { droppable } }) => ({ droppable })"
        :drag-enter-func="dragEnter"
        :drag-over-func="dragOver"
        :drag-leave-func="dragLeave"
        :drop-func="(...params) => drop(...params, week)"
        class="q-pa-md border-10 shadow-5 calendar-styling schedule-calendar">
        <template
          #head-day="{
            scope: {
              timestamp: { weekday }
            }
          }">
          <span class="row justify-center q-mb-sm">{{ weekDays[weekday] }}</span>
        </template>

        <template
          #day-body="{
            scope: {
              timestamp: { weekday },
              timeStartPos,
              timeDurationHeight
            }
          }">
          <template v-for="timeBlockGroup in layoutedTimeBlocks[weekday - 1]">
            <template v-for="(timeBlockColumn, colIndex) in timeBlockGroup">
              <template v-for="timeBlock in timeBlockColumn" :key="timeBlock.id">
                <slot
                  name="time-block"
                  :week-day="weekday - 1"
                  :props="{
                    timeBlock,
                    top: timeStartPos(timeBlock.start),
                    height: timeDurationHeight(timeBlock.duration),
                    left: getTimeBlockLeft(colIndex, timeBlockGroup),
                    width: getTimeBlockWidth(timeBlock, colIndex, timeBlockGroup),
                    timeStartPos,
                    timeDurationHeight,
                    getColor: getStylingGetters(isGeneric(timeBlock) ? 'generic' : timeBlock.group.type)
                      .getColor,
                    getFontSize: getStylingGetters().getFontSize
                  }" />
              </template>
            </template>

            <slot
              name="overlapping"
              :day="weekday - 1"
              :time-start-pos="timeStartPos"
              :time-duration-height="timeDurationHeight" />
          </template>
        </template>

        <template
          v-if="intervalsFront"
          #day-interval="{
            scope: {
              timestamp: { time }
            }
          }">
          <!-- Millora: Fer els handlers del drag and drop manualment aquí  -->
          <div
            v-if="
              time === scheduleIntervalStartTime ||
              time === minutesToTime(timeToMinutes(scheduleIntervalEndTime) - scheduleIntervalMinutes)
            "
            @dragover.stop.prevent
            class="absolute-full bg-b6" />

          <div v-else class="absolute-full z1" />
        </template>
      </q-calendar-day>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.schedule-container
  position: relative
  width: 100%
  height: 100%
.schedule-calendar
  height: calc(100% - 55px)
</style>
