<script setup>
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useCalendar } from '@/util';
import GenericTimeBlocksCreationDialog from '@/components/dialogs/GenericTimeBlocksCreationDialog.vue';

const props = defineProps({
  assignationFilter: Boolean,
  studyFilter: Boolean,
  study: Object,
  getPlacedTimeBlocks: Function,
  getUnplacedTimeBlocks: Function
});
const emit = defineEmits([
  'update:assignation-filter',
  'update:study-filter',
  'create:time-block',
  'remove:time-block',
  'create:generic-time-block',
  'update:generic-time-block',
  'remove:generic-time-block'
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
    .onOk(({ create, modify, remove }) => {
      create.forEach(timeBlock =>
        emit('create:generic-time-block', _.pick(timeBlock, ['label', 'subLabel', 'duration']))
      );
      modify.forEach(timeBlock =>
        emit('update:generic-time-block', timeBlock.id, _.pick(timeBlock, ['label', 'subLabel', 'duration']))
      );
      remove.forEach(id => emit('remove:generic-time-block', id));
    });
const openTimeBlocksCreation = () => {};
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
      label="Blocs genèrics"
      caption="Crea, modifica o esborra blocs horaris genèrics"
      @press="openGenericTimeBlocksCreation" />

    <MenuItemAction
      label="Blocs lectius"
      caption="Crea o esborra blocs horaris pertanyents a un grup concret"
      @press="openTimeBlocksCreation" />
  </q-list>
</template>

<style lang="sass" scoped></style>
