<script setup>
import { useDialogPluginComponent } from 'quasar';

import { useConstants, useGeneral } from '@/util';
import TimeBlockDetailDialogContent from '@/components/schedule/TimeBlockDetailDialogContent.vue';

defineProps({
  start: String,
  end: String,
  duration: Number,
  week: String,
  group: Object,
  subject: Object,
  roomType: Object,
  professor: Object,
  getColor: Function,
  getFontSize: Function
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { groupTypeLabels } = useConstants();
const { text, bg } = useGeneral();
</script>

<template>
  <q-dialog ref="dialogRef" transition-show="rotate" transition-hide="rotate" @hide="onDialogHide">
    <TimeBlockDetailDialogContent
      :start="start"
      :end="end"
      :duration="duration"
      :week="week"
      :label="subject.name"
      :sub-label="`Grup ${groupTypeLabels[group.type]} ${group.number}`"
      :get-color="getColor"
      :get-font-size="getFontSize"
      @ok="onDialogOK">
      <template #room-type="{ containerProps, iconProps }">
        <div :="containerProps">
          <q-icon :="iconProps" />

          {{ roomType?.name || 'Espai no assignat' }}
        </div>
      </template>

      <template #areas="{ containerProps, iconProps }">
        <div :="containerProps">
          <q-icon :="iconProps" />

          <q-list bordered dark class="border-8">
            <q-item v-for="{ abv, name, department } in subject.areas">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ abv }}</q-item-label>

                <q-item-label caption :class="[name ? text(getColor('captions')) : 'text-warning']">
                  {{ name || 'Nom no especificat' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge :color="getColor('detailDeptBg')" class="q-ml-sm q-py-xs">
                  <span :class="text(getColor('detailDept'))">{{ department.abv }}</span>

                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    transition-show="jump-right"
                    transition-hide="jump-left"
                    :class="bg(getColor('detailDeptBg'))">
                    <span :class="text(getColor('detailDept'))">{{ department.name }}</span>
                  </q-tooltip>
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>

      <template #professor="{ containerProps, iconProps }">
        <div :="containerProps">
          <q-icon :="iconProps" />

          {{ professor?.fullName || 'Professor no assignat' }}
        </div>
      </template>

      <template #sharing="{ containerProps, iconProps }">
        <div v-if="subject.sharedBy.length > 1" :="containerProps">
          <q-icon :="iconProps" />

          <q-list v-if="group.studies.length" bordered dark class="border-8">
            <q-item v-for="{ abv, name } in group.studies">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ abv }}</q-item-label>

                <q-item-label
                  caption
                  :lines="1"
                  :class="[name ? text(getColor('captions')) : 'text-warning']">
                  {{ name || 'Nom no especificat' }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <span v-else>Grup no assignat a cap estudi</span>
        </div>
      </template>

      <template #lab-types="{ containerProps, iconProps }">
        <div v-if="group.type === 'small'" :="containerProps">
          <q-icon :="iconProps" />

          <q-list bordered dense dark class="col border-8">
            <q-item v-for="{ name } in subject.labTypes">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
    </TimeBlockDetailDialogContent>
  </q-dialog>
</template>

<style lang="sass" scoped></style>
