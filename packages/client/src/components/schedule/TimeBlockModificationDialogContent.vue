<script setup>
import { ref, computed } from 'vue';
import _ from 'lodash';

import { useConstants, useCalendar, useGeneral } from '@/util';
import TimeBlockDialogContent from '@/components/schedule/TimeBlockDialogContent.vue';

const props = defineProps({
  start: String,
  end: String,
  duration: Number,
  week: String,
  getColor: Function,
  getFontSize: Function
});
defineEmits(['ok', 'cancel']);

const {
  workingDaysShort,
  scheduleIntervalStart,
  scheduleIntervalEnd,
  scheduleIntervalMinutes,
  scheduleDurationMin,
  scheduleIntervalMargin
} = useConstants();
const { timeToMinutes, minutesToTime, getMinPlaceableTime, getMaxPlaceableTime, clampMinutes } =
  useCalendar();
const { text } = useGeneral();

const startTimeMod = ref(props.start || '');
const endTimeMod = ref(props.end || '');
const weekDayMod = ref(2);
const durationTimeMod = ref(minutesToTime(props.duration));
const weekMod = ref(props.week || 'general');

const margin = (scheduleIntervalMargin * scheduleIntervalMinutes) / 60;
const startTimeOptions = (hr, min) => {
  const minHr = Math.trunc(scheduleIntervalStart + margin);
  if (hr < minHr) {
    return false;
  }

  const maxHr = Math.trunc(scheduleIntervalEnd - margin);
  if (hr >= maxHr || (hr === maxHr - 1 && min !== null && min > 60 - scheduleDurationMin)) {
    return false;
  }

  return true;
};
const endTimeOptions = (hr, min) => {
  const minHr = Math.trunc(scheduleIntervalStart + margin);
  if (hr < minHr || (hr === minHr && min !== null && min < scheduleDurationMin)) {
    return false;
  }

  const maxHr = Math.trunc(scheduleIntervalEnd - margin);
  if (hr > maxHr || (hr === maxHr && min !== null && min > 0)) {
    return false;
  }

  return true;
};
const onStartChange = newStartTime => {
  const newEndMinutes = clampMinutes(timeToMinutes(newStartTime) + timeToMinutes(durationTimeMod.value));

  startTimeMod.value = minutesToTime(newEndMinutes - timeToMinutes(durationTimeMod.value));
  endTimeMod.value = minutesToTime(newEndMinutes);
};
const onEndChange = newEndTime => {
  const newStartMinutes = clampMinutes(timeToMinutes(newEndTime) - timeToMinutes(durationTimeMod.value));

  startTimeMod.value = minutesToTime(newStartMinutes);
  endTimeMod.value = minutesToTime(newStartMinutes + timeToMinutes(durationTimeMod.value));
};
const onDurationChange = newDurationTime => {
  const newDurationMinutes = timeToMinutes(newDurationTime);
  const newEndMinutes = clampMinutes(timeToMinutes(startTimeMod.value) + newDurationMinutes);

  endTimeMod.value = minutesToTime(newEndMinutes);
  startTimeMod.value = minutesToTime(newEndMinutes - newDurationMinutes);
};

// Fer el disable del botó de guardar si hi ha errors de validació i fer el guardar.
</script>

<template>
  <TimeBlockDialogContent :get-color="getColor" :get-font-size="getFontSize">
    <template #start-time>
      <TimeInput
        v-model="startTimeMod"
        label="Inici"
        time-picker
        :time-options="startTimeOptions"
        :min-value="getMinPlaceableTime()"
        :max-value="minutesToTime(timeToMinutes(getMaxPlaceableTime()) - scheduleDurationMin)"
        suffix="h"
        icon-size="15pt"
        dense
        :input-color="getColor('headerIcons')"
        :input-text-color="getColor('data')"
        :time-picker-color="getColor('modTimePicker')"
        :time-picker-close-color="getColor('modTimePickerClose')"
        @update:model-value="onStartChange"
        class="time-inputs" />
    </template>

    <template #end-time>
      <TimeInput
        v-model="endTimeMod"
        label="Fi"
        time-picker
        :time-options="endTimeOptions"
        :min-value="minutesToTime(timeToMinutes(getMinPlaceableTime()) + scheduleDurationMin)"
        :max-value="getMaxPlaceableTime()"
        suffix="h"
        icon-size="15pt"
        dense
        :input-color="getColor('headerIcons')"
        :input-text-color="getColor('data')"
        :time-picker-color="getColor('modTimePicker')"
        :time-picker-close-color="getColor('modTimePickerClose')"
        @update:model-value="onEndChange"
        class="time-inputs" />
    </template>

    <template #duration>
      <TimeInput
        v-model="durationTimeMod"
        label="Duració"
        :min-value="minutesToTime(scheduleDurationMin)"
        :max-value="
          minutesToTime(timeToMinutes(getMaxPlaceableTime()) - timeToMinutes(getMinPlaceableTime()))
        "
        suffix="hores"
        dense
        :input-color="getColor('headerIcons')"
        :input-text-color="getColor('data')"
        @update:model-value="onDurationChange"
        class="time-inputs" />
    </template>

    <template #week-day>
      <q-btn-toggle
        v-model="weekDayMod"
        :options="workingDaysShort.map((label, index) => ({ label, value: index }))"
        unelevated
        :toggle-color="getColor('week')">
      </q-btn-toggle>
    </template>

    <template #week>
      <q-tabs
        v-model="weekMod"
        vertical
        no-caps
        dense
        active-color="b7"
        :active-bg-color="getColor('week')"
        indicator-color="transparent"
        :class="text(getColor('week'))"
        class="border-8 bordered-1 bg-b7">
        <q-tab name="general" label="Cada setmana" />

        <q-tab name="A" label="Setmanes A" />

        <q-tab name="B" label="Setmanes B" />
      </q-tabs>
    </template>

    <template #label="props">
      <slot name="label" :="props" />
    </template>

    <template #sub-label="props">
      <slot name="sub-label" :="props" />
    </template>

    <template #room-type="props">
      <slot name="room-type" :="props" />
    </template>

    <template #areas="props">
      <slot name="areas" :="props" />
    </template>

    <template #professor="props">
      <slot name="professor" :="props" />
    </template>

    <template #sharing="props">
      <slot name="sharing" :="props" />
    </template>

    <template #lab-types="props">
      <slot name="lab-types" :="props" />
    </template>

    <template #actions>
      <q-btn label="Cancel·lar" flat no-caps @click="$emit('cancel')" />

      <q-btn
        label="Guardar"
        :color="getColor('okBtn')"
        no-caps
        @click="
          $emit('ok', {
            start: startTimeMod,
            duration: timeToMinutes(durationTimeMod),
            week: weekMod === 'general' ? null : weekMod
          })
        "
        class="save-btn" />
    </template>
  </TimeBlockDialogContent>
</template>

<style lang="sass" scoped>
.save-btn
  width: 80px
.time-inputs
  width: 103px
</style>
