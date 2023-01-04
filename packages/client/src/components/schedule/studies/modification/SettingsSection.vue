<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useScheduleSettingsStore } from '@/stores';
import GenericTimeBlocksCreationDialog from '@/components/dialogs/GenericTimeBlocksCreationDialog.vue';
import TimeBlocksCreationDialog from '@/components/dialogs/TimeBlocksCreationDialog.vue';

const props = defineProps({
  study: Object,
  subjects: Array
});
const emit = defineEmits(['modify-time-blocks', 'modify-generic-time-blocks']);

const $q = useQuasar();
const scheduleSettingsStore = useScheduleSettingsStore();

const openGenericTimeBlocksCreation = () =>
  $q
    .dialog({
      component: GenericTimeBlocksCreationDialog,
      componentProps: {}
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
        subjects: props.subjects
      }
    })
    .onOk(({ create, remove }) => emit('modify-time-blocks', create, remove));
</script>

<template>
  <q-list dark>
    <q-item-label header>Opcions de filtratge</q-item-label>

    <MenuItemToggle
      v-model="scheduleSettingsStore.toggle.assignationFilter"
      label="Només assignats"
      caption="Amaga els blocs horaris el grup dels quals no estigui assignat a cap estudi (en assignatures compartides)"
      keep-color
      color="m6" />

    <MenuItemToggle
      v-model="scheduleSettingsStore.toggle.studyFilter"
      :label="`Només ${study.abv}`"
      caption="Amaga els blocs horaris el grup dels quals només estigui assignat a altres estudis (en assignatures compartides)"
      keep-color
      color="m6" />

    <q-separator spaced dark />

    <q-item-label header>Gestió de blocs horaris</q-item-label>

    <MenuItemAction
      label="Blocs lectius"
      caption="Crea o esborra blocs horaris pertanyents a un grup concret"
      @press="openTimeBlocksCreation" />

    <MenuItemAction
      label="Blocs genèrics"
      caption="Crea, modifica o esborra blocs horaris genèrics"
      @press="openGenericTimeBlocksCreation" />

    <q-separator spaced dark />

    <q-item-label header>Control de solapaments</q-item-label>

    <MenuItemCheck
      v-model="scheduleSettingsStore.check.timeBlocksOverlapping"
      label="Solapaments de blocs horaris"
      caption="Indica a l'horari els solapaments causats per blocs horaris del mateix grup"
      color="m6" />

    <MenuItemCheck
      v-model="scheduleSettingsStore.check.labTypesOverlapping"
      label="Solapaments de laboratoris"
      caption="Indica a l'horari els solapaments causats per l'excés d'aules d'un tipus de laboratori ocupades alhora"
      color="m6" />

    <MenuItemCheck
      v-model="scheduleSettingsStore.check.professorsOverlapping"
      disable
      label="Solapaments de professors"
      caption="Indica a l'horari els solapaments causats per la distribució de professors"
      color="m6" />

    <MenuItemCheck
      v-model="scheduleSettingsStore.check.roomsOverlapping"
      disable
      label="Solapaments d'aules"
      caption="Indica a l'horari els solapaments causats per la distribució d'aules"
      color="m6" />
  </q-list>
</template>

<style lang="sass" scoped></style>
