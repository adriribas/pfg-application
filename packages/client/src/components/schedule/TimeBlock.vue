<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useConstants, useCalendar, useGeneral } from '@/util';
import TimeBlockDetailDialog from '@/components/dialogs/TimeBlockDetailDialog.vue';

const props = defineProps({
  timeBlock: Object,
  leftPercent: Number,
  widthPercent: Number,
  timeStartPos: Function,
  timeDurationHeight: Function
});

const $q = useQuasar();
const { groupTypeLabels, timeBlocksSizeLevels } = useConstants();
const { minutesToTime, getEndTime, getStylingGetters } = useCalendar();
const { text, bg, px, percent, pt } = useGeneral();

const timeBlockRef = ref(null);

const width = ref(0);
const height = ref(0);

const endTime = computed(() => getEndTime(props.timeBlock.start, props.timeBlock.duration));
const classes = computed(() => [bg(getColor('bg'))]);
const positionStyles = computed(() => ({
  top: px(props.timeStartPos(props.timeBlock.start)),
  height: px(props.timeDurationHeight(props.timeBlock.duration)),
  left: percent(props.leftPercent * 100),
  width: percent(props.widthPercent * 100)
}));
const wide = computed(() => width.value - height.value > 100);
const area = computed(() => width.value * height.value);
const sizeLevel = computed(() => timeBlocksSizeLevels.findIndex(max => _.inRange(area.value, null, max)) + 1);

const { getColor, getFontSize } = getStylingGetters(props.timeBlock.group.type);
const subjectLabelFormatters = [
  () => {
    const subject = props.timeBlock.subject;
    return subject.name.split(' ').some(word => word.length * 5.5 > width.value) ? subject.abv : subject.name;
  },
  () =>
    props.timeBlock.subject.abv
      .split(' ')
      .map(word => (word.split('').some(char => char !== 'I') ? word : word.length))
      .join('')
      .replaceAll('.', ''),
  () => props.timeBlock.subject.abv
];
const groupLabelFormatter = [
  () => `Grup ${groupTypeLabels[props.timeBlock.group.type]} ${props.timeBlock.group.number}`,
  () => `${groupTypeLabels[props.timeBlock.group.type][0]}${props.timeBlock.group.number}`,
  () =>
    `${
      wide.value
        ? `G. ${groupTypeLabels[props.timeBlock.group.type]} `
        : groupTypeLabels[props.timeBlock.group.type][0]
    }${props.timeBlock.group.number}`
];

const subjectLabel = computed(() => subjectLabelFormatters[sizeLevel.value]());
const groupLabel = computed(() => groupLabelFormatter[sizeLevel.value]());

const onResize = size => {
  width.value = size.width;
  height.value = size.height;
};
const openTimeBlockDetail = () =>
  $q.dialog({
    component: TimeBlockDetailDialog,
    componentProps: {
      start: props.timeBlock.start,
      end: endTime.value,
      duration: props.timeBlock.duration,
      week: props.timeBlock.week,
      group: props.timeBlock.group,
      subject: props.timeBlock.subject,
      getColor,
      getFontSize
    }
  });

onMounted(() => {
  width.value = timeBlockRef.value.offsetWidth;
  height.value = timeBlockRef.value.offsetHeight;
});
</script>

<template>
  <div
    ref="timeBlockRef"
    @click="openTimeBlockDetail"
    :class="classes"
    class="absolute border-8 shadow-3 text-center cursor-pointer time-block-container"
    :style="positionStyles">
    <div class="column fit flex-center">
      <span :style="{ fontSize: pt(getFontSize('subject')) }">
        {{ subjectLabel }}
      </span>

      <span
        :class="[sizeLevel === 0 && 'q-mt-xs']"
        class="text-bold"
        :style="{ fontSize: pt(getFontSize('group')) }">
        {{ groupLabel }}
      </span>
    </div>

    <q-badge
      v-if="timeBlock.week"
      :label="timeBlock.week"
      :class="bg(getColor('weekBg'))"
      class="absolute border-8 week"
      :style="{
        fontSize: pt(getFontSize('week')),
        opacity: sizeLevel === 1 ? 0.7 : 1
      }" />

    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      transition-show="jump-up"
      transition-hide="jump-down"
      :class="bg(getColor('tooltipBg'))">
      <div class="row items-center">
        <q-icon name="schedule" size="10pt" class="q-mr-xs" />

        {{ timeBlock.start }}h

        <q-icon name="arrow_right" size="9pt" />

        {{ endTime }}h
      </div>

      <div class="row items-center q-mt-xs">
        <q-icon name="hourglass_top" size="10pt" class="q-mr-xs" />

        {{ minutesToTime(timeBlock.duration) }}h
      </div>
    </q-tooltip>

    <q-resize-observer @resize="onResize" />
  </div>
</template>

<style lang="sass" scoped>
.time-block-container
  z-index: 1
  user-select: none
.week
  top: 0
  left: 0
</style>
