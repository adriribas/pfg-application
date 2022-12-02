<script setup>
import { useDialogPluginComponent } from 'quasar';

import TimeBlockDetailDialogContent from '@/components/schedule/TimeBlockDetailDialogContent.vue';

defineProps({
  start: String,
  end: String,
  duration: Number,
  week: String,
  label: String,
  subLabel: String,
  getColor: Function,
  getFontSize: Function
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
</script>

<template>
  <q-dialog ref="dialogRef" transition-show="rotate" transition-hide="rotate" @hide="onDialogHide">
    <TimeBlockDetailDialogContent
      :start="start"
      :end="end"
      :duration="duration"
      :week="week"
      :label="label"
      :sub-label="subLabel"
      :get-color="getColor"
      :get-font-size="getFontSize"
      @ok="onDialogOK">
    </TimeBlockDetailDialogContent>
  </q-dialog>
</template>

<style lang="sass" scoped></style>
