<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  keepColor: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: ''
  }
});
defineEmits(['update:model-value']);
</script>

<template>
  <q-item tag="label" v-ripple.early>
    <q-item-section>
      <q-item-label>{{ label }}</q-item-label>

      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>

    <q-item-section avatar>
      <q-toggle
        :model-value="modelValue"
        :keep-color="keepColor"
        :color="color"
        @update:model-value="value => $emit('update:model-value', value)" />
    </q-item-section>
  </q-item>
</template>

<style lang="sass" scoped></style>
