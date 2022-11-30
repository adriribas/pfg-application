<script setup>
import _ from 'lodash';

const props = defineProps({
  modelValue: Number,
  title: String,
  min: Number,
  max: Number
});
const emit = defineEmits(['update:model-value']);

const clamp = value => _.clamp(value, props.min, props.max);
const increment = () => emit('update:model-value', clamp(props.modelValue + 1));

const decrement = () => emit('update:model-value', clamp(props.modelValue - 1));
</script>

<template>
  <div class="column col-3 items-center parent">
    <span class="col q-mb-xs">{{ title }}</span>
    <q-input
      :model-value="modelValue"
      :mask="'#'.repeat(String(max).match(/\d/g).length)"
      standout="bg-g9"
      dense
      dark
      input-class="text-center"
      @update:model-value="value => emit('update:model-value', +value)"
      @focus="input => input?.target?.select()"
      @blur="!modelValue && $emit('update:model-value', 0)">
      <template #prepend>
        <q-btn icon="remove" size="sm" round unelevated @click="decrement" />
      </template>

      <template #append>
        <q-btn icon="add" size="sm" round unelevated @click="increment" />
      </template>
    </q-input>
  </div>
</template>

<style lang="sass" scoped>
.parent
  min-width: 120px
</style>
