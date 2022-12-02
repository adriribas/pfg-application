<script setup>
import { useCalendar, useGeneral } from '@/util';
import TimeBlockDialogContent from '@/components/schedule/TimeBlockDialogContent.vue';

const props = defineProps({
  start: String,
  end: String,
  duration: Number,
  week: String,
  label: String,
  subLabel: String,
  getColor: Function,
  getFontSize: Function
});
defineEmits(['ok']);

const { minutesToTime } = useCalendar();
const { pt } = useGeneral();
</script>

<template>
  <TimeBlockDialogContent :get-color="getColor" :get-font-size="getFontSize">
    <template #start-time> {{ start }}h </template>

    <template #end-time> {{ end }}h </template>

    <template #duration> {{ minutesToTime(duration) }} hores </template>

    <template #week>
      <q-badge
        :label="week ? `Setmanes ${week}` : 'Cada setmana'"
        outline
        :color="getColor('week')"
        class="q-py-xs"
        :style="{ 'font-size': pt(getFontSize('week')) }" />
    </template>

    <template #label="{ containerProps }">
      <div :="containerProps">{{ label }}</div>
    </template>

    <template #sub-label="{ badgeProps }">
      <q-badge :="badgeProps" :label="subLabel" />
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
      <q-btn label="Tancar" no-caps :color="getColor('okBtn')" @click="$emit('ok')" />
    </template>
  </TimeBlockDialogContent>
</template>

<style lang="sass" scoped></style>
