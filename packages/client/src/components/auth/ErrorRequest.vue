<script setup>
defineProps({
  message: String
});
</script>

<template>
  <p class="text-negative">{{ message }}</p>
</template>
