<script setup>
defineProps({
  title: String
});
</script>

<template>
  <q-card-section class="row items-center">
    <div class="col-4">
      <q-icon name="settings" size="sm" />
      <span class="q-ml-md text-bold">{{ title }}</span>
    </div>

    <div class="col">
      <slot></slot>
    </div>
  </q-card-section>
</template>

<style lang="sass" scoped></style>
