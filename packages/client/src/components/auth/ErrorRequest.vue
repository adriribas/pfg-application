<script setup>
defineProps({
  message: String
});
</script>

<template>
  <span class="text-negative">{{ message }}</span>
</template>
