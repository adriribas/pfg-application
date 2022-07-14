<script setup>
defineProps({
  submitText: String
});
defineEmits(['submit']);
</script>

<template>
  <div>
    <q-form class="q-gutter-lg" autofocus @submit="$emit('submit')">
      <slot />
      <div class="row flex-center">
        <q-btn :label="submitText" type="submit" color="teal-6" size="md" class="col-4" />
      </div>
    </q-form>
  </div>
</template>
