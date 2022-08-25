<script setup>
defineProps({
  area: Object,
  department: Object
});
</script>

<template>
  <div class="row justify-between">
    <div class="col-4 self-start">
      <q-tooltip
        v-show="area.name"
        anchor="center left"
        self="center right"
        transition-show="jump-left"
        transition-hide="jump-right"
        class="bg-b4">
        <span :class="[!area.name && 'text-warning']">
          {{ area.name || 'Nom no especificat' }}
        </span>
      </q-tooltip>
      <span>{{ area.abv }}</span>
    </div>
    <q-badge align="top" outline color="m12" class="q-ml-sm col-auto self-end">
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
        class="text-m12 bg-b4">
        <span :class="[!department.name && 'text-warning']">
          {{ department.name || 'Nom no especificat' }}
        </span>
      </q-tooltip>
      <span>{{ department.abv }}</span>
    </q-badge>
  </div>
</template>

<style lang="sass" scoped></style>
