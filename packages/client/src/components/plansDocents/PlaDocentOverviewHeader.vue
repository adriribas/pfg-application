<script setup>
defineProps({
  title: String,
  icon: String,
  iconColor: String,
  cols: Number
});
</script>

<template>
  <tr>
    <th :colspan="cols">
      <div class="row no-wrap items-center">
        <q-icon :name="icon" size="lg" :color="iconColor" />
        <div class="text-h4 q-ml-md text-white">{{ title }}</div>
      </div>
    </th>
  </tr>
</template>

<style lang="sass" scoped>
th
  position: sticky
</style>
