<script setup>
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import { useGeneral } from '@/util';
import TimeBlockModificationDialogContent from '@/components/schedule/TimeBlockModificationDialogContent.vue';

const props = defineProps({
  day: Number,
  start: String,
  end: String,
  duration: Number,
  week: String,
  label: String,
  subLabel: String,
  getColor: Function,
  getFontSize: Function
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const { text } = useGeneral();

const labelInputRef = ref(null);
const subLabelInputRef = ref(null);
const labelMod = ref(props.label);
const subLabelMod = ref(props.subLabel);

const hasError = computed(() => labelInputRef.value?.hasError || subLabelInputRef.value?.hasError);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-backdrop-dismiss
    no-route-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <TimeBlockModificationDialogContent
      :external-errors="hasError"
      :day="day"
      :start="start"
      :end="end"
      :duration="duration"
      :week="week"
      :get-color="getColor"
      :get-font-size="getFontSize"
      @ok="data => onDialogOK({ ...data, label: labelMod, subLabel: subLabelMod })"
      @cancel="onDialogCancel">
      <template #label>
        <q-input
          ref="labelInputRef"
          v-model="labelMod"
          type="text"
          label="Descripció"
          :rules="[value => !!value]"
          no-error-icon
          dense
          dark
          filled
          :color="getColor('headerIcons')"
          :label-color="getColor('headerIcons')"
          :input-class="[text(getColor('data'))]"
          @focus="() => labelInputRef.select()"
          @keypress.prevent.enter="() => labelInputRef.blur()"
          class="label-input" />
      </template>

      <template #sub-label>
        <q-input
          ref="subLabelInputRef"
          v-model="subLabelMod"
          type="text"
          label="Tipus"
          :rules="[value => !!value]"
          :maxlength="10"
          no-error-icon
          dense
          dark
          filled
          hint="Màxim 10 caràcters"
          :color="getColor('headerIcons')"
          :label-color="getColor('headerIcons')"
          :input-class="[text(getColor('data'))]"
          @focus="() => subLabelInputRef.select()"
          @keypress.prevent.enter="() => subLabelInputRef.blur()"
          class="sub-label-input" />
      </template>
    </TimeBlockModificationDialogContent>
  </q-dialog>
</template>

<style lang="sass" scoped>
.label-input
  width: 325px
.sub-label-input
  width: 152px
</style>
