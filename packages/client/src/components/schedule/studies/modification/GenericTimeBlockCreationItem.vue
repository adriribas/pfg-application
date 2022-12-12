<script setup>
import { ref, computed, watch } from 'vue';
import _ from 'lodash';

import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
  modifyMode: Boolean,
  createMode: Boolean,
  isPlaced: Boolean,
  label: {
    type: String,
    default: ''
  },
  subLabel: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 120
  },
  day: Number,
  start: String,
  week: String,
  showNewIndicator: Boolean
});
defineEmits(['remove', 'enable-modify', 'save', 'cancel-mod', 'cancel-create']);

const { scheduleDurationMin } = useConstants();
const {
  timeToMinutes,
  minutesToTime,
  getMinPlaceableTime,
  getMaxPlaceableTime,
  isValidDurationTime,
  getStylingGetters
} = useCalendar();
const { text } = useGeneral();

const { getColor } = getStylingGetters('generic');

const labelInputRef = ref(null);
const subLabelInputRef = ref(null);
const labelMod = ref(props.label);
const subLabelMod = ref(props.subLabel);
const durationTimeMod = ref(minutesToTime(props.duration));

const isEditable = computed(() => props.modifyMode || props.createMode);
const isValidData = computed(
  () => labelMod.value && subLabelMod.value && isValidDurationTime(durationTimeMod.value, props.start)
);

watch(
  () => props.modifyMode,
  newModifyMode => {
    if (newModifyMode) {
      labelMod.value = props.label;
      subLabelMod.value = props.subLabel;
      durationTimeMod.value = minutesToTime(props.duration);
    }
  }
);
</script>

<template>
  <q-item>
    <div class="row col q-pa-sm border-8 shadow-5 bg-b5">
      <q-badge
        v-if="showNewIndicator"
        label="Nou!"
        floating
        :color="getColor('newIndicator')"
        class="q-mt-sm q-mr-md" />

      <q-item-section v-if="!isEditable" side>
        <q-btn icon="close" size="sm" round unelevated @click="$emit('remove')" />
      </q-item-section>

      <q-item-section side class="col">
        <q-input
          ref="labelInputRef"
          v-if="isEditable"
          v-model="labelMod"
          :autofocus="createMode"
          type="text"
          label="Descripció"
          lazy-rules
          :rules="[value => !!value]"
          hide-bottom-space
          no-error-icon
          dense
          dark
          filled
          :color="getColor('headerIcons')"
          :label-color="getColor('headerIcons')"
          :input-class="[text(getColor('data'))]"
          class="full-width" />

        <q-item-label v-else :lines="1" :class="[text(getColor('detailLabel'))]">
          {{ label }}
        </q-item-label>

        <div :class="text(getColor('data'))" class="row items-center q-mt-sm">
          <q-input
            ref="subLabelInputRef"
            v-if="isEditable"
            v-model="subLabelMod"
            type="text"
            label="Tipus"
            lazy-rules
            :rules="[value => !!value]"
            hide-bottom-space
            :maxlength="10"
            no-error-icon
            dense
            dark
            filled
            :color="getColor('headerIcons')"
            :label-color="getColor('headerIcons')"
            :input-class="[text(getColor('data'))]"
            class="sub-label-input" />

          <q-badge
            v-else
            :label="subLabel"
            :color="getColor('detailSubLabelBg')"
            class="col q-py-xs text-bold text-b7" />

          <q-separator vertical :color="getColor('headerIcons')" class="q-ml-md q-mr-md" />

          <q-icon name="today" size="xs" :color="getColor('headerIcons')" />
          <template v-if="isPlaced">
            <span class="q-ml-xs">Dll</span>
            <span v-if="week">, {{ week }}</span>

            <q-icon name="schedule" size="xs" :color="getColor('headerIcons')" class="q-ml-md" />
            <span class="q-ml-xs">{{ start }}h</span>
          </template>
          <span v-else class="q-ml-xs">No col·locat</span>

          <TimeInput
            v-if="isEditable && !isPlaced"
            v-model="durationTimeMod"
            label="Duració"
            :min-value="minutesToTime(scheduleDurationMin)"
            :max-value="
              minutesToTime(timeToMinutes(getMaxPlaceableTime()) - timeToMinutes(getMinPlaceableTime()))
            "
            suffix="hores"
            dense
            :input-color="getColor('headerIcons')"
            :input-text-color="getColor('data')"
            class="q-ml-md duration-input" />

          <span v-else class="q-ml-md">
            <q-icon name="hourglass_top" size="xs" :color="getColor('headerIcons')" />
            <span class="q-ml-xs">{{ minutesToTime(duration) }}h</span>
          </span>
        </div>
      </q-item-section>

      <q-item-section side>
        <q-btn
          v-if="modifyMode"
          icon="undo"
          no-caps
          dense
          round
          unelevated
          :text-color="getColor('headerIcons')"
          @click="$emit('cancel-mod')"
          class="q-mb-sm" />

        <q-btn
          v-else-if="createMode"
          icon="close"
          dense
          round
          unelevated
          :text-color="getColor('headerIcons')"
          @click="$emit('cancel-create')"
          class="q-mb-sm" />

        <q-btn
          v-else
          icon="edit"
          no-caps
          dense
          round
          unelevated
          :text-color="getColor('headerIcons')"
          @click="$emit('enable-modify')" />

        <q-btn
          v-if="isEditable"
          :disable="!isValidData"
          icon="save"
          no-caps
          dense
          round
          unelevated
          :text-color="getColor('headerIcons')"
          @click="
            isValidData &&
              $emit('save', {
                label: labelMod,
                subLabel: subLabelMod,
                duration: timeToMinutes(durationTimeMod)
              })
          " />
      </q-item-section>
    </div>
  </q-item>
</template>

<style lang="sass" scoped>
.sub-label-input
  width: 120px
.duration-input
  width: 102px
</style>
