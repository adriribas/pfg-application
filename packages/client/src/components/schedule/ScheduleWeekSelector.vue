<script setup>
import { ref } from 'vue';

const props = defineProps({
  week: String
});
defineEmits(['update:week']);

const selectedWeek = ref(props.week);
</script>

<template>
  <q-tabs
    v-model="selectedWeek"
    dense
    indicator-color="transparent"
    active-color="b6"
    active-bg-color="m3"
    @update:model-value="$emit('update:week', selectedWeek)"
    class="shadow-5 bg-b6 tabs-container">
    <q-tab name="general" label="General" />

    <q-tab name="A" label="Setmanes A" />

    <q-tab name="B" label="Setmanes B" />
  </q-tabs>
</template>

<style lang="sass" scoped>
.tabs-container
  border-radius: 8px
</style>
