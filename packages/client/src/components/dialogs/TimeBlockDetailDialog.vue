<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';

import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
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

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { groupTypeLabels } = useConstants();
const { timeToMinutes, minutesToTime } = useCalendar();
const { text, bg, px, percent, pt } = useGeneral();
</script>

<template>
  <q-dialog ref="dialogRef" transition-show="rotate" transition-hide="rotate" @hide="onDialogHide">
    <q-card dark class="bg-b7 dialog-size">
      <q-card-section class="row justify-between items-start">
        <div class="row">
          <div
            :class="text(getColor('detailTime'))"
            class="text-bold"
            :style="{ 'font-size': pt(getFontSize('detailTime')) }">
            <div class="row items-center">
              <q-icon name="schedule" size="20pt" :color="getColor('detailHeaderIcons')" class="q-mr-sm" />
              {{ start }}h

              <q-icon name="arrow_right" size="15pt" :color="getColor('detailHeaderIcons')" class="q-mx-xs" />
              {{ end }}h
            </div>

            <div class="row items-center q-mt-sm">
              <q-icon
                name="hourglass_top"
                size="20pt"
                :color="getColor('detailHeaderIcons')"
                class="q-mr-sm" />
              {{ minutesToTime(duration) }}h
            </div>
          </div>

          <q-separator vertical :color="getColor('detailHeaderIcons')" class="q-ml-lg q-mr-md" />

          <div class="q-mt-xs">
            <div
              :class="text(getColor('detailSubject'))"
              :style="{ 'font-size': pt(getFontSize('detailSubject')) }">
              {{ subject.name }}
            </div>

            <q-badge
              :color="getColor('detailGroupBg')"
              class="q-mt-sm q-py-xs text-bold text-b7"
              :style="{ 'font-size': pt(getFontSize('detailGroup')) }">
              Grup {{ groupTypeLabels[group.type] }} {{ group.number }}
            </q-badge>
          </div>
        </div>

        <q-badge
          outline
          :color="getColor('detailWeek')"
          class="q-ml-xl q-mt-xs q-py-xs"
          :style="{ 'font-size': pt(getFontSize('detailWeek')) }">
          {{ week ? `Setmanes ${week}` : 'Cada setmana' }}
        </q-badge>
      </q-card-section>

      <q-card-section :class="text(getColor('detailData'))" class="row justify-around q-mx-md">
        <div class="column col-auto">
          <div class="row">
            <q-icon name="room" size="20pt" :color="getColor('detailHeaderIcons')" class="q-mr-md" />
            {{ roomType?.name || 'Espai no assignat' }}
          </div>

          <div class="row q-mt-md">
            <q-icon name="domain" size="20pt" :color="getColor('detailHeaderIcons')" />

            <q-list bordered dark class="q-ml-md border-8">
              <q-item v-for="{ abv, name, department } in subject.areas">
                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>

                  <q-item-label caption :class="[!name && 'text-warning']">
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
        </div>

        <div class="column col-auto">
          <div class="row">
            <q-icon name="person" size="20pt" :color="getColor('detailHeaderIcons')" class="q-mr-md" />
            {{ professor?.fullName || 'Professor no assignat' }}
          </div>

          <div class="row q-mt-md">
            <q-icon name="school" size="20pt" :color="getColor('detailHeaderIcons')" />

            <q-list bordered dark class="q-ml-md border-8">
              <q-item v-for="{ abv, name } in [{ abv: 'GEINF', name: 'Grau en Enginyeria Informàtica' }]">
                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>
                  <q-item-label caption :class="[!name && 'text-warning']">
                    {{ name || 'Nom no especificat' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-if="group.type === 'small'" class="row q-mt-md">
            <q-icon name="science" size="20pt" :color="getColor('detailHeaderIcons')" />

            <q-list bordered dense dark class="col q-ml-md border-8">
              <q-item v-for="{ name } in subject.labTypes">
                <q-item-section>
                  <q-item-label>{{ name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-mb-sm q-mr-xs">
        <q-btn label="Tancar" no-caps :color="getColor('detailCloseBtn')" @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  min-width: 800px
  max-width: 95vw
</style>
