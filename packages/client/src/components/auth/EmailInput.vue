<script setup>
import { ref } from 'vue';
const value = ref('');
</script>
<template>
  <q-input
    type="text"
    label="Correu electrònic"
    v-model="value"
    lazy-rules
    :rules="[val => !!val]"
    error-message="Aquest camp és obligatori"
    no-error-icon
    dark
    filled
    color="m14"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false">
    <template #prepend>
      <q-icon name="email" size="28px" />
    </template>
  </q-input>
</template>
