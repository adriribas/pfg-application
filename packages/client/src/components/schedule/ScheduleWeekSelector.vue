<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  week: String,
  dense: Boolean
});
const emit = defineEmits(['update:model-value']);

const value = ref(props.week);

const setWeek = week => {
  if (week !== value.value) {
    value.value = week;
  }
};

watch(value, newWeek => emit('update:model-value', newWeek));
</script>

<template>
  <q-tabs
    v-model="value"
    dense
    indicator-color="transparent"
    active-color="b6"
    active-bg-color="m3"
    class="shadow-5 bg-b6 tabs-container">
    <q-tab
      name="general"
      :label="dense ? 'Tot' : 'General'"
      @dragenter.stop.prevent="setWeek('general')"
      @dragover.prevent />

    <q-tab
      name="A"
      :label="dense ? 'A' : 'Setmanes A'"
      @dragenter.stop.prevent="setWeek('A')"
      @dragover.prevent />

    <q-tab
      name="B"
      :label="dense ? 'B' : 'Setmanes B'"
      @dragenter.stop.prevent="setWeek('B')"
      @dragover.prevent />
  </q-tabs>
</template>

<style lang="sass" scoped>
.tabs-container
  border-radius: 8px
</style>
