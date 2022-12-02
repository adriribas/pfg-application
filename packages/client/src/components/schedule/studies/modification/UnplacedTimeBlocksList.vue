<script setup>
import { useCalendar, useGeneral } from '@/util';

defineProps({
  timeBlocks: Array,
  label: String,
  nPlaced: Number,
  getTimeBlockLabel: Function,
  getColorGetter: Function,
  getFontSize: Function
});
defineEmits(['drag-start', 'drag-end', 'press']);

const { minutesToTime } = useCalendar();
const { bg, pt } = useGeneral();
</script>

<template>
  <q-expansion-item :disable="!timeBlocks.length" default-opened class="q-mb-md">
    <template #header>
      <!-- <q-item-section avatar>
        <q-avatar icon="auto_stories" color="transparent" text-color="" />
      </q-item-section> -->

      <q-item-section>
        <q-item-label :lines="2">{{ label }}</q-item-label>

        <q-item-label caption :lines="1">
          {{ nPlaced }} de {{ nPlaced + timeBlocks.length }} blocs col·locats
        </q-item-label>
      </q-item-section>
    </template>

    <div class="row justify-center">
      <q-table
        v-if="timeBlocks.length"
        grid
        :rows="timeBlocks"
        row-key="id"
        hide-header
        hide-pagination
        card-container-class="justify-center q-gutter-sm"
        class="col-11">
        <template #item="{ row }">
          <div
            draggable="true"
            @dragstart="$emit('drag-start', $event, row.id, row.duration)"
            @dragend="dragEndData => $emit('drag-end', dragEndData)"
            @dragover.stop
            @click="$emit('press', { timeBlock: row, getColor: getColorGetter(row), getFontSize })"
            :class="[bg(getColorGetter(row)('bg'))]"
            class="col-5 q-py-xs border-8 shadow-2 cursor-pointer text-center animated non-selectable"
            :style="{ fontSize: pt(getFontSize('unplacedGroup')) }">
            <span class="text-bold">{{ getTimeBlockLabel(row) }}</span>

            <div class="row no-wrap flex-center">
              <q-icon name="hourglass_top" size="10pt" class="q-mr-xs" />

              {{ minutesToTime(row.duration) }}h
            </div>
          </div>
        </template>
      </q-table>
    </div>
  </q-expansion-item>
</template>

<style lang="sass" scoped></style>
