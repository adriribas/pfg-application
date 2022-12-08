<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useCalendar } from '@/util';
import GenericTimeBlocksCreationDialog from '@/components/dialogs/GenericTimeBlocksCreationDialog.vue';
import TimeBlocksCreationDialog from '@/components/dialogs/TimeBlocksCreationDialog.vue';

const props = defineProps({
  assignationFilter: Boolean,
  studyFilter: Boolean,
  study: Object,
  subjects: Array,
  getPlacedTimeBlocks: Function,
  getSubjectPlacedTimeBlocks: Function,
  getUnplacedTimeBlocks: Function,
  getSubjectUnplacedTimeBlocks: Function
});
const emit = defineEmits([
  'update:assignation-filter',
  'update:study-filter',
  'modify-time-blocks',
  'modify-generic-time-blocks'
]);

const $q = useQuasar();
const { isGeneric } = useCalendar();

const openGenericTimeBlocksCreation = () =>
  $q
    .dialog({
      component: GenericTimeBlocksCreationDialog,
      componentProps: {
        timeBlocks: [..._.flatten(props.getPlacedTimeBlocks()), ...props.getUnplacedTimeBlocks()].filter(
          isGeneric
        )
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
        timeBlocks: [..._.flatten(props.getPlacedTimeBlocks()), ...props.getUnplacedTimeBlocks()].filter(
          timeBlock => !isGeneric(timeBlock)
        )
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
  </q-list>
</template>

<style lang="sass" scoped></style>
