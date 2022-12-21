<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';

import { useAuthStore, useTimeBlocksStore, useOverlappingStore } from '@/stores';
import { studiesApi, subjectsApi, genericTimeBlocksApi } from '@/api';
//import { useStudySchedule } from '@/composables';
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
const timeBlocksStore = useTimeBlocksStore();
const overLappingStore = useOverlappingStore();
//const { loadStudyData, classifyTimeBlocks } = useStudySchedule();
const {} = useConstants();

const loading = ref(false);
const study = ref(null);
const subjects = ref([]);
//const timeBlocks = ref({});

const goToStudyChoosing = () => router.replace({ name: 'studyScheduleChoosing' });

const loadSubjects = async () => {
  const { data: subjects } = await subjectsApi.list({
    params: {
      fields: 'code,abv,name,credits,bigGroups,mediumGroups,smallGroups',
      include: 'Area,LabType,Group'
    },
    filterData: { semester: props.semester },
    associations: { study: props.studyAbv },
    specialOptions: { course: props.course }
  });

  return subjects;
};
const loadStudies = async subjects => {
  const { data: studies } = await studiesApi.list({
    params: { fields: 'abv,name' },
    associations: { subject: subjects.map(({ code }) => code) }
  });

  return studies;
};
const loadGenericTimeBlocks = async () => {
  const { data: genericTimeBlocks } = await genericTimeBlocksApi.list({
    params: {
      fields: 'id,label,labelAbv,subLabel,day,start,duration,week'
    },
    filterData: { study: props.studyAbv, course: props.course, semester: props.semester }
  });

  return genericTimeBlocks;
};
const processStudies = studies =>
  studies.map(({ Subjects: subjects, ...study }) => ({
    subjects: subjects.map(({ code, StudySubject: { course } }) => ({ code, course })),
    ...study
  }));
const processSubjects = (subjects, studies) =>
  subjects.map(({ Areas: areas, Groups: groups, LabTypes: labTypes, Studies, ...subject }) => ({
    ...subject,
    areas: areas.map(({ Department: department, ...area }) => ({ ...area, department })),
    groups: groups.map(({ TimeBlocks: timeBlocks, Studies: studies, ...group }) => ({
      ...group,
      timeBlocks: timeBlocks.map(({ ...timeBlock }) => ({ ...timeBlock /*TODO (professors i aules)*/ })),
      studies: studies?.map(({ ...study }) => ({ ...study })) || null
    })),
    labTypes: labTypes,
    sharedBy: studies.reduce((accum, { abv, name, subjects }) => {
      const sharedSubject = subjects.find(({ code }) => code === subject.code);
      return !sharedSubject ? accum : [...accum, { abv, name, course: sharedSubject.course }];
    }, [])
  }));
const getTimeBlocks = subjects =>
  subjects.reduce(
    (accum, { groups, ...subject }) => [
      ...accum,
      ...groups.reduce(
        (accum, { timeBlocks, ...group }) => [
          ...accum,
          ...timeBlocks.map(timeBlock => ({ subject, group, ...timeBlock }))
        ],
        []
      )
    ],
    []
  );
const load = async () => {
  loading.value = true;
  try {
    const rawSubjects = await loadSubjects();
    const processedStudies = processStudies(await loadStudies(rawSubjects));
    const processedSubjects = processSubjects(rawSubjects, processedStudies);
    const mainStudy = processedStudies.find(({ abv }) => abv === props.studyAbv);

    console.log('Proc studies', processedStudies);
    console.log('Proc subjects', processedSubjects);

    timeBlocksStore.setTimeBlocks([...getTimeBlocks(processedSubjects), ...(await loadGenericTimeBlocks())]);
    study.value = _.pick(mainStudy, ['abv', 'name']);
    subjects.value = processedSubjects /* .map(({ groups, ...subject }) => subject) */;

    if (props.editMode) {
      overLappingStore.initLabTypesOverlapping(props.semester, subjects.value);
    }
  } catch (e) {
    console.error(e);
    goToStudyChoosing();
  }
  loading.value = false;
};

load();
</script>

<template>
  <ViewLoadingSpinner v-if="loading" />

  <StudyScheduleVisualization v-else-if="!editMode" :study="study" :course="course" :semester="semester" />

  <StudyScheduleModification
    v-else
    :study="study"
    :course="course"
    :semester="semester"
    :subjects="subjects" />
</template>

<style lang="sass" scoped></style>
