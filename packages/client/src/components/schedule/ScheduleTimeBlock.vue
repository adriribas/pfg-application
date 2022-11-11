<script setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';

import { useConstants, useCalendar, useGeneral } from '@/util';
import TimeBlockDetailDialog from '@/components/dialogs/TimeBlockDetailDialog.vue';

const props = defineProps({
  timeBlock: Object,
  timeStartPos: Function,
  timeDurationHeight: Function
});

const $q = useQuasar();
const { groupTypeLabels } = useConstants();
const { getPositionInAgrupation, timeToMinutes, minutesToTime, getStylingGetters } = useCalendar();
const { text, bg, px, percent, pt } = useGeneral();

const { getColor, getFontSize } = getStylingGetters(props.timeBlock.group.type);

const endTime = computed(() =>
  minutesToTime(timeToMinutes(props.timeBlock.start) + props.timeBlock.duration)
);
const agrupationSize = computed(() => props.timeBlock.collisions.length + 1);
const relativeAgrupationSize = computed(() => 100 / agrupationSize.value);
const position = computed(() => getPositionInAgrupation(props.timeBlock.index, props.timeBlock.collisions));

const classes = [bg(getColor('bg'))];
const styles = {
  top: px(props.timeStartPos(props.timeBlock.start)),
  height: px(props.timeDurationHeight(props.timeBlock.duration)),
  left: percent(relativeAgrupationSize.value * position.value),
  width: percent(relativeAgrupationSize.value)
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
</script>

<template>
  <div
    @click="openTimeBlockDetail"
    :class="classes"
    class="absolute q-pa-xs border-8 shadow-3 cursor-pointer text-center time-block-container"
    :style="styles">
    <div class="absolute-center">
      <div class="row justify-center">
        <span
          :class="true"
          class="col-auto q-pa-xs border-8"
          :style="{ 'font-size': pt(getFontSize('subject')) }">
          {{ timeBlock.subject.name }}
        </span>
      </div>

      <div class="text-bold" :style="{ 'font-size': pt(getFontSize('group')) }">
        G. {{ groupTypeLabels[timeBlock.group.type] }} {{ timeBlock.group.number }}
      </div>
    </div>

    <q-badge
      v-if="timeBlock.week"
      :label="timeBlock.week"
      :class="bg(getColor('weekBg'))"
      class="border-8 week"
      :style="{ 'font-size': pt(getFontSize('week')) }" />

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
  </div>
</template>

<style lang="sass" scoped>
.time-block-container
  /* align-items: flex-start */
  z-index: 1
  user-select: none
  /* opacity: 0.8 */
.week
  position: absolute
  top: 0
  left: 0
</style>
