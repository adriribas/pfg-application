<script setup>
const props = defineProps({
  area: Object,
  department: Object
});
</script>

<template>
  <div class="row flex-center parent">
    <div class="col-5">
      <q-tooltip
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

    <q-icon name="arrow_right_alt" size="sm" color="m7" class="col q-mx-md" />

    <div class="col-5">
      <q-badge color="m7" class="q-py-xs q-px-xs col-auto">
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
  </div>
</template>

<style lang="sass" scoped>
.parent
  min-width: 200px
</style>
