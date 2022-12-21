<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useTimeBlocksStore } from '@/stores';
import { useCalendar } from '@/util';
import GenericTimeBlocksCreationDialog from '@/components/dialogs/GenericTimeBlocksCreationDialog.vue';
import TimeBlocksCreationDialog from '@/components/dialogs/TimeBlocksCreationDialog.vue';

const props = defineProps({
  assignationFilter: Boolean,
  studyFilter: Boolean,
  timeBlocksOverlapping: Boolean,
  labTypesOverlapping: Boolean,
  professorsOverlapping: Boolean,
  roomsOverlapping: Boolean,
  study: Object,
  subjects: Array
});
const emit = defineEmits([
  'update:assignation-filter',
  'update:study-filter',
  'update:time-blocks-overlapping',
  'update:lab-types-overlapping',
  'update:professors-overlapping',
  'update:rooms-overlapping',
  'modify-time-blocks',
  'modify-generic-time-blocks'
]);

const $q = useQuasar();
const timeBlocksStore = useTimeBlocksStore();
const { isGeneric } = useCalendar();

const openGenericTimeBlocksCreation = () =>
  $q
    .dialog({
      component: GenericTimeBlocksCreationDialog,
      componentProps: {
        timeBlocks: timeBlocksStore.filteredAll(isGeneric)
      }
    })
    .onOk(({ create, update, remove }) => {
      emit(
        'modify-generic-time-blocks',
        create.map(timeBlock => _.pick(timeBlock, ['label', 'subLabel', 'duration'])),
        update.map(timeBlock => _.pick(timeBlock, ['id', 'label', 'subLabel', 'duration'])),
        remove
      );
    });
const openTimeBlocksCreation = () =>
  $q
    .dialog({
      component: TimeBlocksCreationDialog,
      componentProps: {
        studyAbv: props.study.abv,
        subjects: props.subjects.map(subject => _.pick(subject, ['code', 'name', 'groups', 'sharedBy'])),
        timeBlocks: timeBlocksStore.filteredAll(timeBlock => !isGeneric(timeBlock))
      }
    })
    .onOk(({ create, remove }) => emit('modify-time-blocks', create, remove));
</script>

<template>
  <q-list dark>
    <q-item-label header>Opcions de Filtratge</q-item-label>

    <MenuItemToggle
      :model-value="assignationFilter"
      label="Només assignats"
      caption="Amaga els blocs horaris el grup dels quals no estigui assignat a cap estudi (en assignatures compartides)"
      keep-color
      color="m6"
      @update:model-value="value => $emit('update:assignation-filter', value)" />

    <MenuItemToggle
      :model-value="studyFilter"
      :label="`Només ${study.abv}`"
      caption="Amaga els blocs horaris el grup dels quals només estigui assignat a altres estudis (en assignatures compartides)"
      keep-color
      color="m6"
      @update:model-value="value => $emit('update:study-filter', value)" />

    <q-separator spaced dark />

    <q-item-label header>Gestió de Blocs Horaris</q-item-label>

    <MenuItemAction
      label="Blocs lectius"
      caption="Crea o esborra blocs horaris pertanyents a un grup concret"
      @press="openTimeBlocksCreation" />

    <MenuItemAction
      label="Blocs genèrics"
      caption="Crea, modifica o esborra blocs horaris genèrics"
      @press="openGenericTimeBlocksCreation" />

    <q-separator spaced dark />

    <q-item-label header>Control de Solapaments</q-item-label>

    <MenuItemCheck
      :model-value="timeBlocksOverlapping"
      label="Solapaments de blocs horaris"
      caption="Indica a l'horari els els solapaments causats per blocs horaris del mateix grup"
      color="m6"
      @update:model-value="value => $emit('update:time-blocks-overlapping', value)" />

    <MenuItemCheck
      :model-value="labTypesOverlapping"
      label="Solapaments de laboratoris"
      caption="Indica a l'horari els els solapaments causats per l'excés de tipus laboratoris ocupats alhora"
      color="m6"
      @update:model-value="value => $emit('update:lab-types-overlapping', value)" />

    <MenuItemCheck
      :model-value="false && professorsOverlapping"
      disable
      label="Solapaments de professors"
      caption="Indica a l'horari els els solapaments causats per la distribució de professors"
      color="m6"
      @update:model-value="value => $emit('update:professors-overlapping', value)" />

    <MenuItemCheck
      :model-value="false && roomsOverlapping"
      disable
      label="Solapaments d'aules"
      caption="Indica a l'horari els els solapaments causats per la distribució d'aules"
      color="m6"
      @update:model-value="value => $emit('update:rooms-overlapping', value)" />
  </q-list>
</template>

<style lang="sass" scoped></style>
