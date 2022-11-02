<script setup>
import { useAuthStore } from '@/stores/auth.js';
import { studiesApi, subjectsApi } from '@/api';
import MainStudyScheduleChoosing from '@/components/schedule/MainStudyScheduleChoosing.vue';
import SharedStudyScheduleChoosing from '@/components/schedule/SharedStudyScheduleChoosing.vue';

const authStore = useAuthStore();

const { data: studies } = await studiesApi.list({ params: { fields: 'abv,name' } });

const { data: subjects } = await subjectsApi.list({
  params: { fields: 'code' },
  associations: {
    study: studies.map(({ abv }) => abv)
  }
});

const getCourses = studyAbv =>
  subjects
    .reduce((accum, { Studies }) => {
      const study = Studies.find(({ abv }) => abv === studyAbv);
      if (!study) {
        return accum;
      }

      const {
        StudySubject: { course }
      } = study;
      return accum.includes(course) ? accum : [...accum, course];
    }, [])
    .sort((course1, course2) => course1 - course2);

const mainStudy = {
  ...authStore.study,
  courses: getCourses(authStore.study.abv)
};

const sharedStudies = subjects.reduce((accum, { Studies }) => {
  if (Studies.length < 2 || !Studies.some(({ abv }) => abv === authStore.study.abv)) {
    return accum;
  }

  return [
    ...accum,
    ...Studies.reduce((accum2, { abv }) => {
      if (abv === authStore.study.abv || accum.some(study => study.abv === abv)) {
        return accum2;
      }

      return [
        ...accum2,
        { abv, name: studies.find(study => study.abv === abv).name, courses: getCourses(abv) }
      ];
    }, [])
  ];
}, []);

const loadSchedule = (action, studyAbv, course, semester) =>
  console.log({ action, studyAbv, course, semester });
</script>

<template>
  <div class="row flex-center main-container">
    <div class="col-xl-9 col-lg-10 col-md-11 col-sm-12 col-xs-12">
      <MainStudyScheduleChoosing :study="mainStudy" @select="loadSchedule" />

      <div class="q-mt-lg q-px-lg q-py-md overflow-auto shadow-5 bg-b7 shared-studies-container">
        <div class="row flex-center q-mb-md">
          <span class="q-pa-md shadow-2 text-bold bg-b6 text-m2 shared-studies-title">
            Estudis amb els que comparteix assignatures
          </span>
        </div>

        <SharedStudyScheduleChoosing
          v-for="study in sharedStudies"
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
.shared-studies-container
  border-radius: 8px
  max-height: 64vh
.shared-studies-title
  border-radius: 10px
  font-size: 12pt
</style>
