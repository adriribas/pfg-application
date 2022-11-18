<script setup>
import { useConstants } from '@/util';

defineProps({
  dense: Boolean
});

const { groupTypeLabels, timeBlockColorNames } = useConstants();
</script>

<template>
  <div class="row items-center q-px-xs q-py-sm shadow-5 bg-b6 caption-container">
    <div v-for="[groupType, groupLabel] in Object.entries(groupTypeLabels)" class="col-auto q-mx-sm">
      <q-badge :color="timeBlockColorNames[groupType]" />

      <span v-if="!dense" class="q-ml-xs text-m1">{{ groupLabel }}</span>

      <q-tooltip
        anchor="top middle"
        self="bottom middle"
        transition-show="jump-up"
        transition-hide="jump-down"
        :class="`bg-${timeBlockColorNames[groupType]}`">
        <span>Grup {{ groupLabel }}</span>
      </q-tooltip>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.caption-container
  border-radius: 8px
</style>
