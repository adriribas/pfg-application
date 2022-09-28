<script setup>
import { ref } from 'vue';
import _ from 'lodash';

const props = defineProps({
  title: String,
  min: Number,
  max: Number,
  modelValue: Number
});
const emit = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

const clamp = value => _.clamp(value, props.min, props.max);
const increment = () => {
  value.value = clamp(value.value + 1);
  emit('update:modelValue', value.value);
};
const decrement = () => {
  value.value = clamp(value.value - 1);
  emit('update:modelValue', value.value);
};
</script>

<template>
  <div class="column col-3 items-center parent">
    <span class="col q-mb-xs">{{ title }}</span>
    <q-input
      v-model="value"
      :mask="'#'.repeat(String(max).match(/\d/g).length)"
      standout="bg-g9"
      dense
      dark
      @update:model-value="emit('update:modelValue', +value)"
      @focus="input => input?.target?.select()"
      @blur="!value && $emit('update:modelValue', 0)"
      class="input">
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

<style lang="sass">
.input input
  text-align: center
</style>
