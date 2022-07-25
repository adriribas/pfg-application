<script setup>
import { ref, watch } from 'vue';

import { useAcademicCoursesStore } from '@/stores';

const academicCoursesStore = useAcademicCoursesStore();
academicCoursesStore.load();

const selected = ref('current');
const pastSelectedLabel = ref('Cursos anteriors');

watch(selected, selection => {
  if (selection) {
    academicCoursesStore.setActive(academicCoursesStore[selection]);
  }
});

const formatter = (startYear, endYear) => `${startYear} - ${endYear}`;
const selectPast = academicCourse => {
  pastSelectedLabel.value = formatter(academicCourse.startYear, academicCourse.endYear);
  selected.value = '';
  academicCoursesStore.setActive(academicCourse);
};
</script>

<template>
  <div class="wrapper bg-b4">
    <q-tabs
      v-if="academicCoursesStore.loaded"
      v-model="selected"
      align="left"
      no-caps
      outside-arrows
      inline-label
      indicator-color="m5"
      active-color="m5">
      <q-btn-dropdown
        v-if="academicCoursesStore.hasPast"
        :label="pastSelectedLabel"
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
        name="current" />
      <q-tab :label="formatter(academicCoursesStore.next.startYear, academicCoursesStore.next.endYear)" name="next" />
    </q-tabs>
  </div>
</template>

<style lang="sass" scoped>
.wrapper
    max-width: 380px
    border-radius: 8px
    box-shadow: 3px 5px 8px 0px rgba(30, 30, 30, 10)
</style>
