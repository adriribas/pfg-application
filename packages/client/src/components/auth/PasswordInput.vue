<script setup>
import { ref } from 'vue';
const value = ref('');
const isVisiblePassword = ref(false);
defineProps({
  toggleIcon: Boolean
});
</script>
<template>
  <q-input
    :type="isVisiblePassword ? 'text' : 'password'"
    label="Contrasenya"
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
    spellcheck="false">
    <template #append v-if="toggleIcon">
      <q-icon
        :name="isVisiblePassword ? 'visibility' : 'visibility_off'"
        class="cursor-pointer"
        color="teal-3"
        @click="isVisiblePassword = !isVisiblePassword" />
    </template>
  </q-input>
</template>
