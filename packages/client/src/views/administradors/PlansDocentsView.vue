<script setup>
import { ref } from 'vue';

import { useAcademicCoursesStore } from '@/stores';
import AcademicCourseSelector from '@/components/AcademicCourseSelector.vue';
import PlaDocentUploader from '@/components/plansDocents/PlaDocentUploader.vue';
import PlaDocentOverview from '@/components/plansDocents/PlaDocentOverview.vue';

const academicCoursesStore = useAcademicCoursesStore();

const selectedAcademicCourse = ref('current');

const onUploaded = async () => {
  await academicCoursesStore.reload();
  selectedAcademicCourse.value = 'current';
};
</script>

<template>
  <q-page padding>
    <div class="q-pb-lg">
      <AcademicCourseSelector v-model:selected="selectedAcademicCourse" />
    </div>
    <div v-if="!academicCoursesStore.loading">
      <div v-if="!academicCoursesStore.selected?.active" class="row flex-center uploader-layout">
        <div class="col-xl-4 col-lg-5 col-md-7 col-sm-8 col-xs-11">
          <PlaDocentUploader @uploaded="onUploaded" />
        </div>
      </div>
      <PlaDocentOverview v-else />
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.uploader-layout
  height: calc(100vh - 167px)
</style>
