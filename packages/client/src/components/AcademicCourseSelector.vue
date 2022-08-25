<script setup>
import { ref, watch } from 'vue';

import { useAcademicCoursesStore } from '@/stores';

const props = defineProps({
  selected: String
});
const emit = defineEmits(['update:selected']);

const academicCoursesStore = useAcademicCoursesStore();
academicCoursesStore.load();

const selectedPastLabel = ref('Cursos anteriors');

watch(
  () => props.selected,
  selection => {
    if (selection) {
      academicCoursesStore.setSelected(academicCoursesStore[selection]?.startYear);
    }
  }
);

const formatter = (startYear, endYear) => `${startYear} - ${endYear}`;
const selectPast = academicCourse => {
  selectedPastLabel.value = formatter(academicCourse.startYear, academicCourse.endYear);
  academicCoursesStore.setSelected(academicCourse.startYear);
  emit('update:selected');
};
</script>

<template>
  <div class="bg-b4 shadow-5 wrapper tabs">
    <q-tabs
      v-if="academicCoursesStore.loaded"
      v-model="selected"
      align="left"
      no-caps
      outside-arrows
      inline-label
      indicator-color="m5"
      active-color="m5"
      @update:model-value="$emit('update:selected', selected)"
      class="tabs">
      <q-btn-dropdown
        v-if="academicCoursesStore.hasPast"
        :label="selectedPastLabel"
        :loading="academicCoursesStore.loading"
        auto-close
        no-caps
        stretch
        flat
        :text-color="selected ? '' : 'm5'"
        content-class="q-pa-xs bg-b4 text-white text-center">
        <q-list separator>
          <q-item
            v-for="academicCourse in academicCoursesStore.past"
            :key="academicCourse.startYear"
            @click="selectPast(academicCourse)"
            clickable>
            <q-item-section>{{ formatter(academicCourse.startYear, academicCourse.endYear) }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-tab
        :label="formatter(academicCoursesStore.current.startYear, academicCoursesStore.current.endYear)"
        name="current"
        :disable="academicCoursesStore.loading" />
      <q-tab
        v-if="academicCoursesStore.hasNext"
        :label="formatter(academicCoursesStore.next.startYear, academicCoursesStore.next.endYear)"
        name="next"
        :disable="academicCoursesStore.loading" />
    </q-tabs>
  </div>
</template>

<style lang="sass" scoped>
.wrapper
  width: fit-content
.tabs
  border-radius: 8px 8px 0px 0px
</style>
