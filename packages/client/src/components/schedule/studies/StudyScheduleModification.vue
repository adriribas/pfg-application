<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';

import { useAuthStore } from '@/stores';
import {} from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number,
  subjects: Array,
  timeBlocks: Object
});

const $q = useQuasar();
const authStore = useAuthStore();
const { courseLabels, semesterLabels } = useConstants();
const { getEndTime } = useCalendar();
const { text, bg, px, percent, pt } = useGeneral();

const placedTimeBlocks = ref(props.timeBlocks.placed);
const unplacedTimeBlocks = ref(props.timeBlocks.unplaced);

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

const openTimeBlockModification = () => {};
</script>

<template>
  <div class="row modification-container">
    <div class="col-9">
      <Schedule :time-blocks="placedTimeBlocks" @press-time-block="openTimeBlockModification">
        <template #breadcrumbs>
          <Breadcrumbs :elements="breadcrumbsData" />
        </template>
      </Schedule>
    </div>

    <div class="col q-ml-md border-10 bg-b7"></div>
  </div>
</template>

<style lang="sass" scoped>
.modification-container
  min-height: 500px
  height: calc(100vh - 96px)
</style>
