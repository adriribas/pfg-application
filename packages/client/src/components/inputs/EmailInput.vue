<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
});
defineEmits(['update:model-value']);
</script>

<template>
  <q-input
    :model-value="modelValue"
    type="text"
    label="Correu electrònic"
    lazy-rules
    :rules="[value => !!value]"
    error-message="Aquest camp és obligatori"
    no-error-icon
    dark
    filled
    color="m14"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false"
    @update:model-value="value => $emit('update:model-value', value)">
    <template #prepend>
      <q-icon name="email" size="28px" />
    </template>
  </q-input>
</template>
