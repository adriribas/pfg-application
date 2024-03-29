<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import { useSchoolsStore } from '@/stores';
import { useFormatting } from '@/util';
import PlaDocentUploader from '@/components/plansDocents/PlaDocentUploader.vue';
import PlaDocentOverview from '@/components/plansDocents/PlaDocentOverview.vue';

const $q = useQuasar();
const schoolsStore = useSchoolsStore();
const { toLongDate } = useFormatting();

const upload = ref(!schoolsStore.hasPlaDocent);
const uploading = ref(false);

const goToUpload = () =>
  $q
    .dialog({
      title: 'Confirmació',
      message: `Segur que vols iniciar el curs acadèmic <span class="text-bold text-m4">${
        schoolsStore.nextCourse
      }</span> a dia <span class="text-m4">${toLongDate(Date.now())}</span>?`,
      html: true,
      focus: 'none',
      dark: true,
      ok: {
        label: 'Continuar',
        noCaps: true,
        color: 'm5'
      },
      cancel: {
        label: 'Cancel·lar',
        noCaps: true,
        flat: true,
        textColor: 'white'
      }
    })
    .onOk(() => (upload.value = true));
const onUploaded = async () => {
  await schoolsStore.refreshSchoolData();
  uploading.value = false;
  upload.value = false;
};
</script>

<template>
  <q-page padding>
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
              {{ schoolsStore.course }}
            </span>
          </div>

          <q-btn
            :label="`Iniciar el curs ${schoolsStore.nextCourse}`"
            icon="redo"
            no-caps
            color="m8"
            @click="goToUpload">
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
