<script setup>
import { ref } from 'vue';

import { useSchoolsStore } from '@/stores';
import PlaDocentUploader from '@/components/plansDocents/PlaDocentUploader.vue';
import PlaDocentOverview from '@/components/plansDocents/PlaDocentOverview.vue';

const schoolsStore = useSchoolsStore();

const upload = ref(!schoolsStore.hasPlaDocent);
const uploading = ref(false);

const onUploaded = async () => {
  await schoolsStore.refreshSchoolData();
  uploading.value = false;
  upload.value = false;
};
</script>

<template>
  <q-page padding v-auto-animate>
    <div v-if="schoolsStore.loading" class="absolute-center">
      <q-spinner-ball size="7em" color="m5" />
    </div>

    <div v-else-if="upload" class="absolute-center">
      <div v-show="schoolsStore.hasPlaDocent" class="row justify-center q-mb-xl">
        <q-btn
          :disable="uploading"
          label="Tornar al curs actual"
          icon="undo"
          no-caps
          outline
          color="m5"
          @click="upload = !upload" />
      </div>

      <PlaDocentUploader @startUpload="uploading = true" @uploaded="onUploaded" class="q-mb-xl" />
    </div>

    <div v-else class="row justify-center">
      <div class="col-xl-11 col-xs-12 main-container">
        <div class="row justify-between items-center q-mb-md">
          <div class="row items-center shadow-5 bg-b6 course-container">
            <span class="q-py-sm q-px-md bg-b4 text-g3 course-text">Curs acadèmic</span>

            <span class="q-py-sm q-px-md bg-b6 text-m12 course-years">
              {{ schoolsStore.startYear }} - {{ schoolsStore.endYear }}
            </span>
          </div>

          <q-btn
            :label="`Iniciar el curs ${schoolsStore.nextStartYear} - ${schoolsStore.nextEndYear}`"
            icon="redo"
            no-caps
            color="m8"
            @click="upload = !upload">
          </q-btn>
        </div>

        <div class="overview-container">
          <PlaDocentOverview />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.main-container
  height: 90vh
.overview-container
  height: calc(90vh - 62px)
.course-title
  font-style: italic
.course-container
  border-radius: 10px
  font-size: 15pt
.course-text
  border-radius: 10px 50px 50px 10px
.course-years
  border-radius: 0px 10px 10px 0px
</style>
