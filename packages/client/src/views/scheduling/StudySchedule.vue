<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores';
import { useStudySchedule } from '@/composables';
import { useConstants } from '@/util';
import StudyScheduleVisualization from '@/components/schedule/studies/StudyScheduleVisualization.vue';
import StudyScheduleModification from '@/components/schedule/studies/modification/StudyScheduleModification.vue';

const props = defineProps({
  studyAbv: String,
  course: Number,
  semester: Number,
  editMode: Boolean
});

const router = useRouter();
const authStore = useAuthStore();
const { loadStudyData, classifyTimeBlocks } = useStudySchedule();
const {} = useConstants();

const loading = ref(false);
const study = ref(null);
const subjects = ref([]);
const timeBlocks = ref({});

const goToStudyChoosing = () => {
  router.replace({ name: 'studyScheduleChoosing' });
};

(async () => {
  loading.value = true;

  try {
    const studyData = await loadStudyData(props.studyAbv, props.course, props.semester);
    console.log(studyData);

    study.value = studyData.study;
    subjects.value = studyData.subjects;
    timeBlocks.value = classifyTimeBlocks(subjects.value);
  } catch (e) {
    console.error(e);
    goToStudyChoosing();
  }

  loading.value = false;
})();
</script>

<template>
  <ViewLoadingSpinner v-if="loading" />

  <StudyScheduleVisualization
    v-else-if="!editMode"
    :study-abv="studyAbv"
    :course="course"
    :semester="semester"
    :time-blocks="timeBlocks.placed" />

  <StudyScheduleModification
    v-else
    :study="study"
    :course="course"
    :semester="semester"
    :subjects="subjects"
    :time-blocks="timeBlocks" />
</template>

<style lang="sass" scoped></style>
