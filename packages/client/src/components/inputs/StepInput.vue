<script setup>
import _ from 'lodash';

const props = defineProps({
  modelValue: Number,
  title: {
    type: String,
    default: ''
  },
  min: Number,
  max: Number
});
defineEmits(['update:model-value']);

const clamp = value => _.clamp(value, props.min, props.max);
</script>

<template>
  <div class="column col-3 items-center parent">
    <span class="col q-mb-xs">{{ title }}</span>
    <q-input
      :model-value="modelValue"
      :mask="'#'.repeat(max.toString().length)"
      standout="bg-g9"
      dense
      dark
      input-class="text-center"
      @update:model-value="value => emit('update:model-value', +value)"
      @focus="input => input?.target?.select()"
      @blur="!modelValue && $emit('update:model-value', 0)">
      <template #prepend>
        <q-btn
          icon="remove"
          size="sm"
          round
          unelevated
          @click="$emit('update:model-value', clamp(modelValue - 1))" />
      </template>

      <template #append>
        <q-btn
          icon="add"
          size="sm"
          round
          unelevated
          @click="$emit('update:model-value', clamp(modelValue + 1))" />
      </template>
    </q-input>
  </div>
</template>

<style lang="sass" scoped>
.parent
  min-width: 120px
</style>
