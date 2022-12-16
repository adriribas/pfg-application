<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: String,
    required: true
  },
  toggleIcon: {
    type: Boolean,
    default: false
  },
  customLabel: {
    type: String,
    default: 'Contrasenya'
  }
});
defineEmits(['update:model-value']);

const hidden = ref(true);
</script>
<template>
  <q-input
    :model-value="modelValue"
    :type="hidden ? 'password' : 'text'"
    :label="customLabel"
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
      <q-icon name="key" size="28px" />
    </template>

    <template #append v-if="toggleIcon">
      <q-icon
        :name="hidden ? 'visibility_off' : 'visibility'"
        color="m3"
        @click="hidden = !hidden"
        class="cursor-pointer" />
    </template>
  </q-input>
</template>
