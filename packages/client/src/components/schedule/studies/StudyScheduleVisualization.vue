<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useTimeBlocksStore } from '@/stores';
import { useConstants, useCalendar } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';
import TimeBlock from '@/components/schedule/TimeBlock.vue';
import TimeBlockDetailDialog from '@/components/dialogs/TimeBlockDetailDialog.vue';
import GenericTimeBlockDetailDialog from '@/components/dialogs/GenericTimeBlockDetailDialog.vue';

const props = defineProps({
  study: Object,
  course: Number,
  semester: Number
});

const $q = useQuasar();
const timeBlocksStore = useTimeBlocksStore();
const { courseLabels, semesterLabels } = useConstants();
const { getEndTime, isGeneric } = useCalendar();

const breadcrumbsData = [
  {
    icon: 'calendar_month',
    to: 'studyScheduleChoosing',
    color: 'm6'
  },
  { icon: 'school', label: props.study.abv },
  { label: courseLabels[props.course - 1] },
  { label: `${semesterLabels[props.semester - 1]} Q` }
];

const filter = timeBlock =>
  isGeneric(timeBlock) ||
  timeBlock.subject.sharedBy.length <= 1 ||
  timeBlock.group.studies.some(({ abv }) => abv === props.study.abv);

const openDetail = ({ day, timeBlock, getColor, getFontSize }) => {
  const { start, duration, week } = timeBlock;
  const commonProps = { day, start, end: getEndTime(start, duration), duration, week, getColor, getFontSize };

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
    <Schedule :time-blocks="timeBlocksStore.filteredPlaced(filter)" @press-time-block="openDetail">
      <template #breadcrumbs>
        <Breadcrumbs :elements="breadcrumbsData" />
      </template>

      <template #time-block="{ weekDay, props }">
        <TimeBlock :="props" :day="weekDay" @press="data => openDetail({ day: weekDay, ...data })" />
      </template>
    </Schedule>
  </div>
</template>

<style lang="sass" scoped>
.visualization-container
  min-height: 500px
  height: calc(100vh - 96px)
</style>
