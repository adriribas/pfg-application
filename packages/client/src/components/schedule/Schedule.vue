<script setup>
import { ref, computed } from 'vue';

import ScheduleWeekSelector from '@/components/schedule/ScheduleWeekSelector.vue';

const props = defineProps({
  subjects: Array,
  timeBlocks: Object
});

const week = ref('general');
const placedTimeBlocks = computed(() =>
  props.timeBlocks.placed.map(dayTimeBlocks =>
    dayTimeBlocks.filter(
      ({ week: timeBlockWeek }) =>
        (!timeBlockWeek && week.value === 'general') || timeBlockWeek === week.value
    )
  )
);
console.log({ placedTimeBlocks: placedTimeBlocks.value });
</script>

<template>
  <div class="row justify-center">
    <div class="col q-pa-md bg-b8 schedule-main-container">
      <div class="row justify-between">
        <slot name="breadcrumbs" />

        <ScheduleWeekSelector v-model="week" />
      </div>

      <div class="schedule-body-container"></div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.schedule-main-container
  border-radius: 10px
</style>
