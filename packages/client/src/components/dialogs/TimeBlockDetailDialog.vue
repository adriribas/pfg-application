<script setup>
import { useDialogPluginComponent } from 'quasar';

import { useCalendar, useGeneral } from '@/util';
import TimeBlockDialogContent from '@/components/schedule/TimeBlockDialogContent.vue';

const props = defineProps({
  start: String,
  end: String,
  duration: Number,
  week: String,
  group: Object,
  subject: Object,
  roomType: Object,
  professor: Object,
  getColor: Function,
  getFontSize: Function
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { minutesToTime } = useCalendar();
const { pt, text } = useGeneral();
</script>

<template>
  <q-dialog ref="dialogRef" transition-show="rotate" transition-hide="rotate" @hide="onDialogHide">
    <TimeBlockDialogContent
      :group="group"
      :subject="subject"
      :room-type="roomType"
      :professor="professor"
      :get-color="getColor"
      :get-font-size="getFontSize">
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

      <template #sharing>
        <q-list v-if="group.studies.length" bordered dark class="border-8">
          <q-item v-for="{ abv, name } in group.studies">
            <q-item-section>
              <q-item-label :class="[text(getColor('data'))]">{{ abv }}</q-item-label>

              <q-item-label caption :lines="1" :class="[name ? text(getColor('captions')) : 'text-warning']">
                {{ name || 'Nom no especificat' }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <span v-else>Grup no assignat a cap estudi</span>
      </template>

      <template #actions>
        <q-btn label="Tancar" no-caps :color="getColor('okBtn')" @click="onDialogOK" />
      </template>
    </TimeBlockDialogContent>
  </q-dialog>
</template>

<style lang="sass" scoped></style>
