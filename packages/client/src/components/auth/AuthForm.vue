<script setup>
defineProps({
  submitText: String
});
defineEmits(['submit']);
</script>

<template>
  <q-form autofocus @submit="$emit('submit')" class="q-gutter-lg">
    <slot />

    <div class="row flex-center">
      <q-btn :label="submitText" type="submit" color="m6" size="md" class="col-4" />
    </div>
  </q-form>
</template>

<style lang="sass" scoped></style>
