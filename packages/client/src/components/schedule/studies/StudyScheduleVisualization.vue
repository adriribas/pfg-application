<script setup>
import { useQuasar } from 'quasar';

import { useConstants, useCalendar } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlockDetailDialog from '@/components/dialogs/TimeBlockDetailDialog.vue';

const props = defineProps({
  studyAbv: String,
  course: Number,
  semester: Number,
  timeBlocks: Array
});
const emit = defineEmits([]);

const $q = useQuasar();

const { courseLabels, semesterLabels } = useConstants();
const { getEndTime } = useCalendar();

const breadcrumbsData = [
  {
    icon: 'calendar_month',
    to: 'studyScheduleChoosing',
    color: 'm6'
  },
  { icon: 'school', label: props.studyAbv },
  { label: courseLabels[props.course - 1] },
  { label: `${semesterLabels[props.semester - 1]} Q` }
];

const isShared = ({ sharedBy }) => sharedBy.length > 1;
const filter = ({ subject, group: { studies } }) =>
  !isShared(subject) || studies.some(({ abv }) => abv === props.studyAbv);
const openTimeBlockDetail = ({
  timeBlock: { start, duration, week, group, subject },
  getColor,
  getFontSize
}) =>
  $q.dialog({
    component: TimeBlockDetailDialog,
    componentProps: {
      start,
      end: getEndTime(start, duration),
      duration,
      week,
      group,
      subject,
      getColor,
      getFontSize
    }
  });
</script>

<template>
  <div class="border-10 shadow-5 bg-b8 visualization-container">
    <Schedule
      :time-blocks="timeBlocks.map(weekDayTimeBlocks => weekDayTimeBlocks.filter(filter))"
      @press-time-block="openTimeBlockDetail">
      <template #breadcrumbs>
        <Breadcrumbs :elements="breadcrumbsData" />
      </template>
    </Schedule>
  </div>
</template>

<style lang="sass" scoped>
.visualization-container
  min-height: 500px
  height: calc(100vh - 96px)
</style>
