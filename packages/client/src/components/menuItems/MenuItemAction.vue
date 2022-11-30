<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  }
});
defineEmits(['press']);
</script>

<template>
  <q-item v-ripple.early clickable @click="$emit('press')">
    <q-item-section>
      <q-item-label>{{ label }}</q-item-label>

      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<style lang="sass" scoped></style>
