<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useConstants, useCalendar } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlockDetailDialog from '@/components/dialogs/TimeBlockDetailDialog.vue';
import GenericTimeBlockDetailDialog from '@/components/dialogs/GenericTimeBlockDetailDialog.vue';

const props = defineProps({
  studyAbv: String,
  course: Number,
  semester: Number,
  timeBlocks: Array
});
const emit = defineEmits([]);

const $q = useQuasar();

const { courseLabels, semesterLabels } = useConstants();
const { getEndTime, isGeneric } = useCalendar();

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

const openDetail = ({ timeBlock, getColor, getFontSize }) => {
  const { start, duration, week } = timeBlock;
  const commonProps = { start, end: getEndTime(start, duration), duration, week, getColor, getFontSize };

  if (isGeneric(timeBlock)) {
    const { label, subLabel } = timeBlock;
    $q.dialog({
      component: GenericTimeBlockDetailDialog,
      componentProps: { label, subLabel, ...commonProps }
    });
  } else {
    const { group, subject /* , roomType, professor  */ } = timeBlock;
    $q.dialog({
      component: TimeBlockDetailDialog,
      componentProps: {
        ...commonProps,
        group,
        subject
        /* roomType,
        professor, */
      }
    });
  }
};
</script>

<template>
  <div class="border-10 shadow-5 bg-b8 visualization-container">
    <Schedule
      :time-blocks="
        timeBlocks.map(weekDayTimeBlocks =>
          weekDayTimeBlocks.filter(timeBlock => isGeneric(timeBlock) || filter(timeBlock))
        )
      "
      @press-time-block="openDetail">
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
