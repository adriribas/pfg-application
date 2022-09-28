<script setup>
import { ref } from 'vue';

import { useSchoolsStore } from '@/stores';
import PlaDocentUploader from '@/components/plansDocents/PlaDocentUploader.vue';
import PlaDocentOverview from '@/components/plansDocents/PlaDocentOverview.vue';

const schoolsStore = useSchoolsStore();

const upload = ref(!schoolsStore.hasPlaDocent);

const onUploaded = async () => {
  await schoolsStore.refreshSchoolData();
  upload.value = false;
};
</script>

<template>
  <q-page padding>
    <div v-if="schoolsStore.loading" class="row flex-center vertical-center">
      <q-spinner-ball size="7em" color="m5" />
    </div>

    <div v-else>
      <div
        v-show="schoolsStore.hasPlaDocent"
        :class="upload ? 'justify-end' : 'justify-between'"
        class="row items-center q-mb-lg">
        <span v-show="!upload" class="text-m2 text-h5 course-title">
          Curs {{ schoolsStore.startYear }} - {{ schoolsStore.endYear }}
        </span>

        <q-btn
          :label="
            upload
              ? 'Tornar al curs actual'
              : `Iniciar el curs ${schoolsStore.nextStartYear} - ${schoolsStore.nextEndYear}`
          "
          :icon="upload ? 'undo' : 'redo'"
          no-caps
          :outline="upload"
          :color="upload ? 'm4' : 'm8'"
          @click="upload = !upload">
        </q-btn>
      </div>

      <div v-if="upload" class="row flex-center vertical-center">
        <PlaDocentUploader @uploaded="onUploaded" />
      </div>

      <div v-else>
        <PlaDocentOverview />
      </div>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.vertical-center
  height: calc(100vh - 240px)
.course-title
  font-style: italic
</style>
