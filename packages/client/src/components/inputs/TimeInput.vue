<script setup>
import { ref, computed, watch } from 'vue';
import _ from 'lodash';

import { useCalendar, useGeneral } from '@/util';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  label: String,
  timePicker: Boolean,
  timeOptions: Function,
  minValue: {
    type: String,
    default: '00:00'
  },
  maxValue: {
    type: String,
    default: '23:59'
  },
  suffix: {
    type: String,
    default: ''
  },
  iconSize: String,
  inputColor: String,
  inputTextColor: String,
  timePickerColor: String,
  timePickerCloseColor: String,
  dense: Boolean
});
const emit = defineEmits(['update:model-value']);

const { timeToMinutes, minutesToTime } = useCalendar();
const { text } = useGeneral();

const inputRef = ref(null);
const tempValue = ref(props.modelValue);

const externalValue = computed(() => props.modelValue);

const emitIfValid = () => {
  if (inputRef.value.validate(tempValue.value)) {
    emit('update:model-value', tempValue.value);
  }
};
const updateTempValue = value => {
  if (value.length !== 5) {
    tempValue.value = value;
    return;
  }

  tempValue.value = minutesToTime(
    _.clamp(timeToMinutes(value), timeToMinutes(props.minValue), timeToMinutes(props.maxValue))
  );
};
const onUpdate = value => {
  updateTempValue(value);
  emitIfValid();
};
const onCloseTimePicker = () => {
  emitIfValid();
  setTimeout(inputRef.value.blur, 120);
};

watch(externalValue, newExternalValue => updateTempValue(newExternalValue));
</script>

<template>
  <q-input
    ref="inputRef"
    :model-value="tempValue"
    :label="label"
    :placeholder="'- - : - -'"
    mask="time"
    :rules="['time']"
    :suffix="suffix"
    :dense="dense"
    no-error-icon
    hide-bottom-space
    filled
    dark
    :color="inputColor"
    :label-color="inputColor"
    :input-class="[text(inputTextColor)]"
    @update:model-value="onUpdate"
    @focus="() => inputRef.select()"
    @blur="emitIfValid"
    @keypress.prevent.enter="emitIfValid">
    <template #append v-if="timePicker">
      <q-icon name="history_toggle_off" :color="inputColor" :size="iconSize" class="q-ml-xs cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time
            :model-value="tempValue"
            :options="timeOptions"
            format24h
            dark
            :color="timePickerColor"
            @update:model-value="onUpdate">
            <div class="row justify-end items-center">
              <q-btn
                v-close-popup
                label="Tancar"
                no-caps
                :color="timePickerCloseColor"
                @click="onCloseTimePicker" />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<style lang="sass" scoped></style>
