<script setup>
defineProps({
  modelValue: String,
  dense: Boolean
});
defineEmits(['update:model-value']);
</script>

<template>
  <!-- Canviar-ho per button toggle -->
  <q-tabs
    :model-value="modelValue"
    dense
    indicator-color="transparent"
    active-color="b6"
    active-bg-color="m3"
    @update:model-value="value => $emit('update:model-value', value)"
    class="border-8 shadow-5 bg-b6">
    <q-tab
      name="general"
      :label="dense ? 'Tot' : 'General'"
      @dragenter.stop.prevent="$emit('update:model-value', 'general')"
      @dragover.prevent />

    <q-tab
      name="A"
      :label="dense ? 'A' : 'Setmanes A'"
      @dragenter.stop.prevent="$emit('update:model-value', 'A')"
      @dragover.prevent />

    <q-tab
      name="B"
      :label="dense ? 'B' : 'Setmanes B'"
      @dragenter.stop.prevent="$emit('update:model-value', 'B')"
      @dragover.prevent />
  </q-tabs>
</template>

<style lang="sass" scoped></style>
