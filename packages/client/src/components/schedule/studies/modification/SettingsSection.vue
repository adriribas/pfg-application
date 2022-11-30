<script setup>
import { useQuasar } from 'quasar';

const props = defineProps({
  assignationFilter: Boolean,
  studyFilter: Boolean,
  study: Object,
  getPlacedTimeBlocks: Function,
  getUnplacedTimeBlocks: Function
});
const emit = defineEmits(['update:assignation-filter', 'update:study-filter']);

const $q = useQuasar();

const openGenericBlocksDialog = () => {};
const openGroupBlocksDialog = () => {};
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
      label="Blocs Genèrics"
      caption="Crea, modifica o esborra blocs horaris genèrics"
      @press="openGenericBlocksDialog" />

    <MenuItemAction
      label="Blocs de grups"
      caption="Crea o esborra blocs horaris pertanyents a un grup en concret"
      @press="openGroupBlocksDialog" />
  </q-list>
</template>

<style lang="sass" scoped></style>
