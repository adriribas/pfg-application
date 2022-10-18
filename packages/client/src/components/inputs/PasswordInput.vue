<script setup>
import { ref } from 'vue';
const value = ref('');
const isVisiblePassword = ref(false);
defineProps({
  toggleIcon: Boolean,
  customLabel: String
});
</script>
<template>
  <q-input
    :type="isVisiblePassword ? 'text' : 'password'"
    :label="customLabel || 'Contrasenya'"
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
      <q-icon name="key" size="28px" />
    </template>

    <template #append v-if="toggleIcon">
      <q-icon
        :name="isVisiblePassword ? 'visibility' : 'visibility_off'"
        class="cursor-pointer"
        color="m3"
        @click="isVisiblePassword = !isVisiblePassword" />
    </template>
  </q-input>
</template>
