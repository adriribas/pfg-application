<script setup>
import { useConstants, useCalendar } from '@/util';
import UnplacedTimeBlocksList from '@/components/schedule/studies/modification/UnplacedTimeBlocksList.vue';

defineProps({
  subjects: Array,
  dragging: Boolean,
  getSubjectPlaced: Function,
  getGenericPlaced: Function,
  getSubjectUnplaced: Function,
  getGenericUnplaced: Function
});
defineEmits(['drag-start', 'drag-end', 'drop', 'press']);

const { groupTypeLabels } = useConstants();
const { sortTimeBlocks, getStylingGetters } = useCalendar();
</script>

<template>
  <div>
    <div
      v-if="dragging"
      @dragover.prevent
      @drop.prevent="dropData => $emit('drop', dropData)"
      class="absolute-full z1 q-mx-sm border-8 bg-g5 unplaced-drop-zone" />

    <UnplacedTimeBlocksList
      :time-blocks="getGenericUnplaced()"
      label="Genèrics"
      :n-placed="getGenericPlaced().length"
      :get-time-block-label="({ subLabel }) => subLabel"
      :get-color-getter="() => getStylingGetters('generic').getColor"
      :get-font-size="getStylingGetters().getFontSize"
      @drag-start="(...data) => $emit('drag-start', ...data, true)"
      @drag-end="(...data) => $emit('drag-end', ...data)"
      @press="(...data) => $emit('press', ...data)" />

    <UnplacedTimeBlocksList
      v-for="subject in subjects"
      :key="subject.code"
      :time-blocks="sortTimeBlocks(getSubjectUnplaced(subject.code))"
      :label="subject.name"
      :n-placed="getSubjectPlaced(subject.code).length"
      :get-time-block-label="({ group: { type, number } }) => `G${groupTypeLabels[type][0]} ${number}`"
      :get-color-getter="({ group: { type } }) => getStylingGetters(type).getColor"
      :get-font-size="getStylingGetters().getFontSize"
      @drag-start="(...data) => $emit('drag-start', ...data, false)"
      @drag-end="(...data) => $emit('drag-end', ...data)"
      @press="(...data) => $emit('press', ...data)" />
  </div>
</template>

<style lang="sass" scoped>
.unplaced-drop-zone
  opacity: 0.4
</style>
