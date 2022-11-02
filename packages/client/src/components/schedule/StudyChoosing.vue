<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores';
import { useConstants } from '@/util';
import { useStudyChoosing } from '@/composables';
import MainStudyScheduleChoosing from '@/components/schedule/MainStudyScheduleChoosing.vue';
import OtherStudyScheduleChoosing from '@/components/schedule/OtherStudyScheduleChoosing.vue';

const router = useRouter();
const authStore = useAuthStore();
const { roleMapping } = useConstants();
const studiesLoader = useStudyChoosing(roleMapping[authStore.role]);

const mainStudy = ref(null);
const otherStudies = ref(null);

(async () => {
  const { mainStudyData, otherStudiesData } = await studiesLoader();

  mainStudy.value = mainStudyData;
  otherStudies.value = otherStudiesData;
})();

const loadSchedule = (action, studyAbv, course, semester) =>
  router.push({ name: 'studySchedule', params: { studyAbv, course, semester }, query: { action } });
</script>

<template>
  <div class="row flex-center main-container">
    <div class="col-xl-9 col-lg-10 col-md-11 col-sm-12 col-xs-12">
      <MainStudyScheduleChoosing v-if="mainStudy" :study="mainStudy" @select="loadSchedule" />

      <div
        v-if="otherStudies?.data.length"
        class="q-mt-lg q-px-lg q-py-md overflow-auto shadow-5 bg-b7 other-studies-container">
        <div class="row flex-center q-mb-md">
          <span class="q-pa-md shadow-2 text-bold bg-b6 text-m2 other-studies-title">
            {{ otherStudies.title }}
          </span>
        </div>

        <OtherStudyScheduleChoosing
          v-for="study in otherStudies.data"
          :study="study"
          @select="loadSchedule"
          class="q-my-md" />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.main-container
  height: 90vh
.other-studies-container
  border-radius: 8px
  max-height: 64vh
.other-studies-title
  border-radius: 10px
  font-size: 12pt
</style>
