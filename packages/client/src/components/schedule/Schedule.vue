<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import { QCalendarDay } from '@quasar/quasar-ui-qcalendar/src/QCalendarDay.js';
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass';
import '@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass';

import { useConstants, useCalendar } from '@/util';
import ScheduleWeekSelector from '@/components/schedule/ScheduleWeekSelector.vue';
import ScheduleTimeBlock from '@/components/schedule/ScheduleTimeBlock.vue';
import ScheduleColorCaption from '@/components/schedule/ScheduleColorCaption.vue';
import '@/css/calendar-variables.sass';

const props = defineProps({
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const { weekDays, scheduleIntervalStart, scheduleIntervalEnd, scheduleIntervalMinutes } = useConstants();
const { calcIntervalStart, calcIntervalCount, timeToMinutes, updateCollisions } = useCalendar();

const calendar = ref(null);
const week = ref('general');
const placedTimeBlocks = computed(() =>
  props.timeBlocks.placed.map(dayTimeBlocks => {
    const toShowTimeBlocks = dayTimeBlocks
      .filter(
        ({ week: timeBlockWeek }) =>
          (!timeBlockWeek && week.value === 'general') || timeBlockWeek === week.value
      )
      .sort(({ start: start1 }, { start: start2 }) => timeToMinutes(start1) - timeToMinutes(start2))
      .map((timeBlock, index) => ({ ...timeBlock, index }));

    updateCollisions(toShowTimeBlocks);

    return toShowTimeBlocks;
  })
);

console.log('Placed timeBlocks', placedTimeBlocks.value);
placedTimeBlocks.value.forEach((dayTimeBlocks, i) => {
  console.log(`DAY ${i}`);
  dayTimeBlocks.forEach(({ start, collisions, collisionsArray, group: { type, number } }) =>
    console.log(`TimeBlock for group ${type}-${number} (${start})`, collisions)
  );
});

const abc = scope => console.log({ scope });
</script>

<template>
  <div class="row justify-center">
    <div class="col q-pa-md bg-b8 schedule-main-container">
      <div class="row justify-between items-center">
        <slot name="breadcrumbs" />

        <ScheduleColorCaption v-if="$q.screen.gt.xs" :show-label="$q.screen.gt.sm" />

        <ScheduleWeekSelector v-model="week" />
      </div>

      <div class="row justify-center schedule-body-container">
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
              <template v-for="timeBlock in placedTimeBlocks[weekday - 1]">
                <ScheduleTimeBlock
                  :time-block="timeBlock"
                  :time-start-pos="timeStartPos"
                  :time-duration-height="timeDurationHeight" />
              </template>
            </template>
          </q-calendar-day>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.schedule-main-container
  border-radius: 10px
  min-height: 500px
  height: 90vh
  max-width: 100%
/* .schedule-body-container */
.schedule-calendar-container
  display: flex
  width: 100%
  height: 800px
.schedule-calendar
  border-radius: 10px
</style>
