<script setup>
import { ref, provide } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores';
import { useStudySchedule } from '@/composables';
import { useConstants } from '@/util';
import Schedule from '@/components/schedule/Schedule.vue';

const props = defineProps({
  studyAbv: String,
  course: Number,
  semester: Number,
  editMode: Boolean
});

const router = useRouter();
const authStore = useAuthStore();
const { loadStudyData, classifyTimeBlocks } = useStudySchedule();
const { courseLabels, semesterLabels } = useConstants();

const loading = ref(false);
const study = ref(null);
const subjects = ref([]);
const timeBlocks = ref({});

const breadcrumbsData = [
  {
    icon: props.editMode ? 'edit_calendar' : 'calendar_month',
    to: 'studyScheduleChoosing',
    color: 'm6'
  },
  { icon: 'school', label: props.studyAbv },
  { label: courseLabels[props.course - 1] },
  { label: `${semesterLabels[props.semester - 1]} Q` }
];

provide('study', study);
provide('course', props.course);
provide('semester', props.semester);
provide('editMode', props.editMode);

const goToStudyChoosing = () => {
  router.replace({ name: 'studyScheduleChoosing' });
};

(async () => {
  loading.value = true;
  try {
    const studyData = await loadStudyData(props.studyAbv, props.course, props.semester);
    study.value = studyData.study;
    subjects.value = studyData.subjects;
    //console.log('Subjects', subjects.value);

    timeBlocks.value = classifyTimeBlocks(subjects.value);
    //console.log('TimeBlocks', timeBlocks.value);
  } catch (e) {
    console.error(e);
    goToStudyChoosing();
  }
  loading.value = false;
})();
</script>

<template>
  <ViewLoadingSpinner v-if="loading" />

  <Schedule :subjects="subjects" :time-blocks="timeBlocks" v-else>
    <template #breadcrumbs>
      <Breadcrumbs :elements="breadcrumbsData" />
    </template>
  </Schedule>
</template>

<style lang="sass" scoped></style>
