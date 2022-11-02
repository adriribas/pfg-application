<script setup>
const props = defineProps({
  studyAbv: String,
  course: Number,
  semester: Number
});
</script>

<template>
  <div>Study: {{ studyAbv }}</div>
  <div>Course: {{ course }}</div>
  <div>Semester: {{ semester }}</div>
  <div>Action: {{ $route.query.action }}</div>
</template>

<style lang="sass" scoped></style>
