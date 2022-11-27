<script setup>
import { ref, computed, watch } from 'vue';
import _ from 'lodash';

import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
  timeBlock: Object,
  enableResizers: Boolean,
  top: Number,
  height: Number,
  left: Number,
  width: Number,
  timeStartPos: Function,
  timeDurationHeight: Function
});
const emit = defineEmits(['press', 'resize']);

const {
  groupTypeLabels,
  scheduleIntervalMinutes,
  scheduleIntervalStartTime,
  scheduleIntervalEndTime,
  timeBlocksSizeLevels
} = useConstants();
const { timeToMinutes, minutesToTime, getEndTime, getNearestIntervalTime, getStylingGetters } = useCalendar();
const { bg, px, percent, pt } = useGeneral();

const { getColor, getFontSize } = getStylingGetters(props.timeBlock.group.type);

const timeBlockRef = ref(null);
const calcTop = ref(props.top);
const calcHeight = ref(props.height);
const widthPx = ref(0);
const resizing = ref(false);

const endTime = computed(() => getEndTime(props.timeBlock.start, props.timeBlock.duration));
const classes = computed(() => [bg(getColor('bg')), resizing.value && 'z2 resizing']);
const positionStyles = computed(() => ({
  top: px(calcTop.value),
  height: px(calcHeight.value),
  left: percent(props.left),
  width: percent(props.width)
}));
const wide = computed(() => widthPx.value - calcHeight.value > 100);
const area = computed(() => widthPx.value * calcHeight.value);
const sizeLevel = computed(() => timeBlocksSizeLevels.findIndex(max => _.inRange(area.value, null, max)) + 1);

const subjectLabelFormatters = [
  () => {
    const subject = props.timeBlock.subject;
    return subject.name.split(' ').some(word => word.length * 6.5 > widthPx.value)
      ? subject.abv
      : subject.name;
  },
  () =>
    props.timeBlock.subject.abv
      .split(' ')
      .map(word => (word.split('').some(char => char !== 'I') ? word : word.length))
      .join('')
      .replaceAll('.', ''),
  () => props.timeBlock.subject.abv
];
const groupLabelFormatters = [
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
const groupLabel = computed(() => groupLabelFormatters[sizeLevel.value]());

const updateWidthPx = newWidth => (widthPx.value = newWidth);

const resizeFromTop = ({ delta: { y: delta }, isFinal }) => {
  resizing.value = true;
  if (
    calcHeight.value - delta >= props.timeDurationHeight(scheduleIntervalMinutes) &&
    calcTop.value + delta >= props.timeStartPos(scheduleIntervalStartTime)
  ) {
    calcTop.value += delta;
    calcHeight.value -= delta;
  }

  if (isFinal) {
    const currentTop = calcTop.value;
    const newStartTime = getNearestIntervalTime(calcTop.value);

    calcTop.value = props.timeStartPos(newStartTime);
    calcHeight.value += currentTop - calcTop.value;

    emit('resize', {
      start: newStartTime,
      duration: timeToMinutes(endTime.value) - timeToMinutes(newStartTime)
    });
    resizing.value = false;
  }
};

const resizeFromBottom = ({ delta: { y: delta }, isFinal }) => {
  resizing.value = true;
  if (
    calcHeight.value + delta >= props.timeDurationHeight(scheduleIntervalMinutes) &&
    props.timeStartPos(props.timeBlock.start) + calcHeight.value + delta <=
      props.timeStartPos(scheduleIntervalEndTime)
  ) {
    calcHeight.value += delta;
  }

  if (isFinal) {
    const currentEndTimePx = props.timeStartPos(props.timeBlock.start) + calcHeight.value;
    const newEndTime = getNearestIntervalTime(currentEndTimePx);

    calcHeight.value += props.timeStartPos(newEndTime) - currentEndTimePx;

    emit('resize', { duration: timeToMinutes(newEndTime) - timeToMinutes(props.timeBlock.start) });
    resizing.value = false;
  }
};

watch(props, (newProps, oldProps) => {
  if (newProps.top !== oldProps.top) {
    calcTop.value = newProps.top;
  }
  if (newProps.height !== oldProps.height) {
    calcHeight.value = newProps.height;
  }
});
</script>

<template>
  <div
    ref="timeBlockRef"
    @click="$emit('press', { timeBlock, getColor, getFontSize })"
    :class="classes"
    class="absolute border-8 shadow-3 text-center cursor-pointer non-selectable"
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

    <q-resize-observer @resize="({ width }) => updateWidthPx(width)" />

    <template v-if="enableResizers">
      <div
        v-touch-pan.prevent.mouse.vertical="resizeFromTop"
        class="row absolute justify-center cursor-ns-resize resizer-outer"
        :style="{ top: 0 }">
        <div :class="[bg(getColor('resizer'))]" class="col-5 border-8 resizer-inner" />
      </div>
      <div
        v-touch-pan.prevent.mouse.vertical="resizeFromBottom"
        class="row absolute justify-center items-end cursor-ns-resize resizer-outer"
        :style="{ bottom: 0 }">
        <div :class="[bg(getColor('resizer'))]" class="col-5 border-8 resizer-inner" />
      </div>
    </template>
  </div>
</template>

<style lang="sass" scoped>
.week
  top: 0
  left: 0
.resizer-outer
  width: 100%
  height: 10px
.resizer-inner
  height: 3px
.resizing
  opacity: 0.8
</style>
