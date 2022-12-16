<script setup>
import { useGeneral } from '@/util';

defineProps({
  top: Number,
  height: Number
});

const { px } = useGeneral();
</script>

<template>
  <div class="absolute full-width marker" :style="{ top: px(top), height: px(height) }"></div>
</template>

<style lang="sass" scoped>
.marker
  opacity: 0.6
  background-color: $g10
</style>
