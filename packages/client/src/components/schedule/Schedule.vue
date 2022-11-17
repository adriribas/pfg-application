<script setup>
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';

import { QCalendarDay } from '@quasar/quasar-ui-qcalendar/src/QCalendarDay.js';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass';

import { useConstants, useCalendar } from '@/util';
import ScheduleWeekSelector from '@/components/schedule/ScheduleWeekSelector.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import ScheduleColorCaption from '@/components/schedule/ScheduleColorCaption.vue';
import '@/css/calendar-variables.sass';

const props = defineProps({
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { weekDays, scheduleIntervalStart, scheduleIntervalEnd, scheduleIntervalMinutes } = useConstants();
const { calcIntervalStart, calcIntervalCount, layoutTimeBlocks, getTimeBlockColSpan } = useCalendar();

const calendarRef = ref(null);
const week = ref('general');
const placedTimeBlocks = ref(props.timeBlocks.placed);
const unplacedTimeBlocks = ref(props.timeBlocks.unplaced);

const layoutedTimeBlocks = ref([]);

const increaseUpdatesNumber = () => {
  placedTimeBlocks.value.forEach(weekDayTimeBlocks =>
    weekDayTimeBlocks.forEach(timeBlock => {
      timeBlock.nUpdates ??= 0;
      timeBlock.nUpdates++;
    })
  );
};
const updateCalendarLayout = () => {
  increaseUpdatesNumber();
  layoutedTimeBlocks.value = placedTimeBlocks.value.map(weekDayTimeBlocks =>
    layoutTimeBlocks(
      week.value === 'general'
        ? weekDayTimeBlocks
        : weekDayTimeBlocks.filter(timeBlock => timeBlock.week === week.value)
    )
  );
};

updateCalendarLayout();
watch(week, updateCalendarLayout);
</script>

<template>
  <div class="q-pa-md bg-b8 schedule-main-container">
    <div class="row justify-between items-center">
      <slot name="breadcrumbs" />

      <ScheduleColorCaption v-if="$q.screen.gt.xs" :show-label="$q.screen.gt.sm" />

      <ScheduleWeekSelector v-model="week" />
    </div>

    <div class="q-mt-md schedule-calendar-container">
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
        class="q-pa-md shadow-5 calendar-styling schedule-calendar">
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
              <template v-for="timeBlock in timeBlockColumn" :key="`${timeBlock.id}-${timeBlock.nUpdates}`">
                <TimeBlock
                  :time-block="timeBlock"
                  :left-percent="colIndex / timeBlockGroup.length"
                  :width-percent="
                    getTimeBlockColSpan(timeBlock, colIndex, timeBlockGroup) / timeBlockGroup.length
                  "
                  :time-start-pos="timeStartPos"
                  :time-duration-height="timeDurationHeight" />
              </template>
            </template>
          </template>
        </template>
      </q-calendar-day>
    </div>
  </div>

  <!-- <div class="q-pa-md bg-b8 schedule-main-container">
    <div class="row justify-between items-center">
      <slot name="breadcrumbs" />

      <ScheduleColorCaption v-if="$q.screen.gt.xs" :show-label="$q.screen.gt.sm" />

      <ScheduleWeekSelector v-model="week" />
    </div>

    <div class="q-mt-md schedule-calendar-container">
      <q-calendar-day
        ref="calendar"
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
        class="q-pa-md shadow-5 calendar-styling schedule-calendar">
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
                <TimeBlock
                  :time-block="timeBlock"
                  :left-percent="colIndex / timeBlockGroup.length"
                  :width-percent="
                    getTimeBlockColSpan(timeBlock, colIndex, timeBlockGroup) / timeBlockGroup.length
                  "
                  :time-start-pos="timeStartPos"
                  :time-duration-height="timeDurationHeight" />
              </template>
            </template>
          </template>
        </template>
      </q-calendar-day>
    </div>
  </div> -->
</template>

<style lang="sass" scoped>
.schedule-main-container
  border-radius: 10px
  min-height: 500px
  height: 90vh
/* .schedule-body-container */
.schedule-calendar-container
  display: flex
  height: calc(90vh - 90px)
  width: calc(100vw - 80px)

.schedule-calendar
  border-radius: 10px
</style>
