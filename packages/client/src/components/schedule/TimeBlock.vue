<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import _ from 'lodash';

import { useOverlappingStore } from '@/stores';
import { useOverlapping, useTimeBlockFormatting } from '@/composables';
import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
  timeBlock: Object,
  day: Number,
  enableResizers: Boolean,
  /* showTimeBlocksOverlapping: Boolean,
  showLabTypesOverlapping: Boolean,
  showProfessorsOverlapping: Boolean,
  showRoomsOverlapping: Boolean, */
  top: Number,
  height: Number,
  left: Number,
  width: Number,
  timeStartPos: Function,
  timeDurationHeight: Function,
  getColor: Function,
  getFontSize: Function
});
const emit = defineEmits(['press', 'resize']);

const overlappingStore = useOverlappingStore();
const { scheduleIntervalMinutes } = useConstants();
const {
  timeToMinutes,
  minutesToTime,
  getEndTime,
  getNearestIntervalTime,
  getMinPlaceableTime,
  getMaxPlaceableTime,
  isGeneric
} = useCalendar();
const { bg, px, percent, pt } = useGeneral();

const timeBlockRef = ref(null);
const widthPx = ref(0);
const calcHeight = ref(props.height);

const { timeBlocksOverlapping, labTypesOverlapping, professorOverlapping, roomOverlapping, isOverlapped } =
  useOverlapping(
    computed(() => props.timeBlock),
    computed(() => props.day)
  );
const { sizeLevel, label, subLabel } = useTimeBlockFormatting(
  computed(() => props.timeBlock),
  widthPx,
  calcHeight
);

const calcTop = ref(props.top);
const resizing = ref(false);

const endTime = computed(() => getEndTime(props.timeBlock.start, props.timeBlock.duration));
/* const hasTimeBlocksOverlapping = computed(
  () => props.showTimeBlocksOverlapping && timeBlocksOverlapping.value
);
const hasLabTypesOverlapping = computed(
  () =>
    props.showLabTypesOverlapping &&
    !isGeneric(props.timeBlock) &&
    props.timeBlock.group.type === 'small' &&
    labTypesOverlapping.value.some(({ studies }) => studies.length)
);
const hasProfessorsOverlapping = computed(() => props.showProfessorsOverlapping && false);
const hasRoomsOverlapping = computed(() => props.showRoomsOverlapping && false);
const isOverlapped = computed(
  () =>
    hasTimeBlocksOverlapping.value ||
    hasLabTypesOverlapping.value ||
    hasProfessorsOverlapping.value ||
    hasRoomsOverlapping.value
); */
const classes = computed(() => [
  bg(props.getColor('bg')),
  resizing.value && 'z2 resizing',
  isOverlapped.value && 'overlapped-border'
]);
const positionStyles = computed(() => ({
  top: px(calcTop.value),
  height: px(calcHeight.value),
  left: percent(props.left),
  width: percent(props.width)
}));

const updateWidthPx = newWidth => (widthPx.value = newWidth);
const enableOverlappingMarkers = () => {
  if (!isGeneric(props.timeBlock)) {
    overlappingStore.setSelectedDay(props.day);
    overlappingStore.setSelectedLabTypes(props.timeBlock.subject.labTypes);
  }
};
const disableOverlappingMarkers = () => {
  if (!isGeneric(props.timeBlock)) {
    overlappingStore.clear();
  }
};
const resizeFromTop = ({ delta: { y: delta }, isFirst, isFinal }) => {
  resizing.value = true;
  if (isFirst) {
    enableOverlappingMarkers();
  }
  if (
    calcHeight.value - delta >= props.timeDurationHeight(scheduleIntervalMinutes) &&
    calcTop.value + delta >= props.timeStartPos(getMinPlaceableTime())
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
    disableOverlappingMarkers();
    resizing.value = false;
  }
};
const resizeFromBottom = ({ delta: { y: delta }, isFirst, isFinal }) => {
  resizing.value = true;
  if (isFirst) {
    enableOverlappingMarkers();
  }
  if (
    calcHeight.value + delta >= props.timeDurationHeight(scheduleIntervalMinutes) &&
    props.timeStartPos(props.timeBlock.start) + calcHeight.value + delta <=
      props.timeStartPos(getMaxPlaceableTime())
  ) {
    calcHeight.value += delta;
  }

  if (isFinal) {
    const currentEndTimePx = props.timeStartPos(props.timeBlock.start) + calcHeight.value;
    const newEndTime = getNearestIntervalTime(currentEndTimePx);

    calcHeight.value += props.timeStartPos(newEndTime) - currentEndTimePx;

    emit('resize', { duration: timeToMinutes(newEndTime) - timeToMinutes(props.timeBlock.start) });
    disableOverlappingMarkers();
    resizing.value = false;
  }
};

watch(
  () => props.top,
  newTop => (calcTop.value = newTop)
);
watch(
  () => props.height,
  newHeight => (calcHeight.value = newHeight)
);

onMounted(() => {});
</script>

<template>
  <div
    ref="timeBlockRef"
    @click="
      $emit('press', {
        timeBlock,
        timeBlocksOverlapping,
        labTypesOverlapping,
        professorOverlapping,
        roomOverlapping,
        getColor,
        getFontSize
      })
    "
    :class="classes"
    class="absolute border-8 shadow-3 text-center cursor-pointer non-selectable container"
    :style="positionStyles">
    <div class="column fit flex-center">
      <span :style="{ fontSize: pt(getFontSize('subject')) }">
        {{ label }}
      </span>

      <span
        :class="[sizeLevel === 0 && 'q-mt-xs']"
        class="text-bold"
        :style="{ fontSize: pt(getFontSize('group')) }">
        {{ subLabel }}
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
        <div :class="[bg(getColor('resizer'))]" class="col-5 top-resizer resizer-inner" />
      </div>

      <div
        v-touch-pan.prevent.mouse.vertical="resizeFromBottom"
        class="row absolute justify-center items-end cursor-ns-resize resizer-outer"
        :style="{ bottom: 0 }">
        <div :class="[bg(getColor('resizer'))]" class="col-5 bottom-resizer resizer-inner" />
      </div>
    </template>
  </div>
</template>

<style lang="sass" scoped>
.container:hover
  filter: brightness(1.25)
.overlapped-border
  border: 3px solid $negative
.week
  top: 0
  left: 0
.resizer-outer
  width: 100%
  height: 10px
.resizer-inner
  height: 3px
.top-resizer
  border-radius: 0px 0px 8px 8px
.bottom-resizer
  border-radius: 8px 8px 0px 0px
.resizing
  opacity: 0.8
</style>
