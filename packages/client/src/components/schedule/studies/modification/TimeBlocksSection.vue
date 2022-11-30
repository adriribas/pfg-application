<script setup>
import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
  subjects: Array,
  dragging: Boolean,
  getPlaced: Function,
  getUnplaced: Function
});
defineEmits(['drag-start', 'drag-end', 'drop', 'press']);

const { groupTypeLabels } = useConstants();
const { minutesToTime, sortTimeBlocks, getStylingGetters } = useCalendar();
const { bg, pt } = useGeneral();

const getColor = (groupType, color) => getStylingGetters(groupType).getColor(color);
const getFontSize = (groupType, fontSize) => getStylingGetters(groupType).getFontSize(fontSize);
</script>

<template>
  <div>
    <div
      v-if="dragging"
      @dragover.prevent
      @drop.prevent="dropData => $emit('drop', dropData)"
      class="absolute-full z1 q-mx-sm border-8 bg-g5 unplaced-drop-zone" />

    <q-expansion-item
      v-for="subject in subjects"
      :key="subject.code"
      :disable="!getUnplaced(subject.code).length"
      default-opened
      :label-lines="2"
      icon="auto_stories"
      :label="subject.name"
      header-class=""
      expand-icon-class=""
      class="q-mb-md">
      <template #header>
        <!-- <q-item-section avatar>
          <q-avatar icon="auto_stories" color="transparent" text-color="" />
        </q-item-section> -->

        <q-item-section>
          <q-item-label :lines="2">{{ subject.name }}</q-item-label>

          <q-item-label caption :lines="1" class="">
            {{ getPlaced(subject.code).length }} de
            {{ getPlaced(subject.code).length + getUnplaced(subject.code).length }}
            blocs col·locats
          </q-item-label>
        </q-item-section>
      </template>

      <div class="row justify-center">
        <q-table
          v-if="getUnplaced(subject.code).length"
          grid
          :rows="sortTimeBlocks(getUnplaced(subject.code))"
          row-key="id"
          hide-header
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          card-container-class="justify-center q-gutter-sm"
          class="col-11">
          <template #item="{ row }">
            <div
              draggable="true"
              @click="
                $emit('press', {
                  timeBlock: row,
                  getColor: getStylingGetters(row.group.type).getColor,
                  getFontSize: getStylingGetters(row.group.type).getFontSize
                })
              "
              @dragstart="$emit('drag-start', $event, row.id, row.duration)"
              @dragend="dragEndData => $emit('drag-end', dragEndData)"
              @dragover.stop
              :class="[bg(getColor(row.group.type, 'bg'))]"
              class="col-5 q-py-xs border-8 shadow-2 cursor-pointer text-center animated non-selectable"
              :style="{ fontSize: pt(getFontSize(row.group.type, 'unplacedGroup')) }">
              <span class="text-bold">
                G{{ groupTypeLabels[row.group.type][0] }} {{ row.group.number }}
              </span>
              <div class="row no-wrap flex-center">
                <q-icon name="hourglass_top" size="10pt" class="q-mr-xs" />
                {{ minutesToTime(row.duration) }}h
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </q-expansion-item>
  </div>
</template>

<style lang="sass" scoped>
.unplaced-drop-zone
  opacity: 0.4
</style>
