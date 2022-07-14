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
    error-message="El camp no pot estar buit"
    no-error-icon
    dark
    filled
    color="teal-14"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false" />
</template>
