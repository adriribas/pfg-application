<script setup>
const props = defineProps({
  elements: Array,
  textColor: {
    type: String,
    default: 'm2'
  },
  bgColor: {
    type: String,
    default: 'b6'
  },
  separatorColor: {
    type: String,
    default: 'm12'
  }
});
</script>

<template>
  <q-breadcrumbs
    :class="[`text-${textColor}`, `bg-${bgColor}`]"
    class="q-px-md q-py-sm shadow-5 breadcrumbs-container">
    <template #separator>
      <q-icon name="chevron_right" size="1.5em" :color="separatorColor" />
    </template>

    <q-breadcrumbs-el
      v-for="{ icon, label, to, color } in elements"
      :icon="icon"
      :label="label"
      :to="to && { name: to }"
      :class="[color && `text-${color}`]" />
  </q-breadcrumbs>
</template>

<style lang="sass" scoped>
.breadcrumbs-container
  border-radius: 8px
</style>
