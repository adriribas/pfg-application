<script setup>
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import { useConstants, useGeneral } from '@/util';
import TimeBlockModificationDialogContent from '@/components/schedule/TimeBlockModificationDialogContent.vue';

const props = defineProps({
  day: Number,
  start: String,
  end: String,
  duration: Number,
  week: String,
  group: Object,
  subject: Object,
  roomType: Object,
  professor: Object,
  labTypesOverlapping: Array,
  getColor: Function,
  getFontSize: Function
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const { courseLabels, groupTypeLabels } = useConstants();
const { text, bg } = useGeneral();

const sharedBySelectRef = ref(null);
const sharedByMod = ref([...props.group.studies]);
const toAddSharedBy = ref(null);

const sharedByOptions = computed(() => _.differenceBy(props.subject.sharedBy, sharedByMod.value, 'abv'));

const addSharedBy = study => {
  sharedByMod.value.push(study);
  toAddSharedBy.value = null;
  sharedBySelectRef.value.blur();
};
const removeSharedBy = index => sharedByMod.value.splice(index, 1);
const getOverlappingStudies = labTypeName => {
  const labType = props.labTypesOverlapping.find(({ name }) => name === labTypeName);

  return labType?.studies || [];
};

// Fer el disable del botó de guardar si hi ha errors de validació.
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
      :day="day"
      :start="start"
      :end="end"
      :duration="duration"
      :week="week"
      :get-color="getColor"
      :get-font-size="getFontSize"
      @ok="data => onDialogOK({ ...data, sharedBy: sharedByMod })"
      @cancel="onDialogCancel">
      <template #label="{ containerProps }">
        <div :="containerProps">{{ subject.name }}</div>
      </template>

      <template #sub-label="{ badgeProps }">
        <q-badge :="badgeProps" :label="`Grup ${groupTypeLabels[group.type]} ${group.number}`" />
      </template>

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

          <q-list bordered dark v-auto-animate class="border-8 shared-by-list">
            <q-item v-for="({ abv, name }, index) in sharedByMod">
              <q-item-section side center>
                <q-btn icon="close" size="sm" round unelevated @click="removeSharedBy(index)" />
              </q-item-section>
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
            <q-item v-if="sharedByOptions.length">
              <q-item-section class="row">
                <div class="col">
                  <q-select
                    ref="sharedBySelectRef"
                    v-model="toAddSharedBy"
                    label="Afegir estudi"
                    :options="sharedByOptions"
                    option-label="abv"
                    map-options
                    dense
                    filled
                    dark
                    :color="getColor('headerIcons')"
                    :label-color="getColor('headerIcons')"
                    @update:model-value="addSharedBy">
                    <template #option="{ itemProps, opt: { abv, name } }">
                      <q-item :="itemProps">
                        <q-item-section>
                          <q-item-label :class="[text(getColor('data'))]">{{ abv }}</q-item-label>
                          <q-item-label
                            caption
                            :lines="1"
                            :class="[name ? text(getColor('captions')) : 'text-warning']">
                            {{ name }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>

      <template #lab-types="{ containerProps, iconProps }">
        <div v-if="group.type === 'small'" :="containerProps">
          <q-icon :="iconProps" />

          <q-list bordered dark class="col border-8">
            <q-item v-for="{ name, amount } in subject.labTypes">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ name }}</q-item-label>
                <q-item-label caption :class="[text(getColor('captions'))]">
                  {{ amount }} laboratori{{ amount > 1 ? 's' : '' }}
                </q-item-label>
              </q-item-section>

              <template v-if="day !== -1 && getOverlappingStudies(name).length">
                <q-item-section avatar>
                  <q-icon name="join_left" color="negative" />
                </q-item-section>

                <q-tooltip
                  anchor="center right"
                  self="center left"
                  transition-show="jump-right"
                  transition-hide="jump-left"
                  class="bg-negative">
                  <q-list dark>
                    <q-item v-for="study of getOverlappingStudies(name)" class="no-padding">
                      <q-item-section>
                        <q-item-label class="row items-center fs-10">
                          <span>{{ study.notAssigned ? 'NO ASSIGNATS' : study.abv }}</span>
                          <q-icon name="circle" size="5pt" color="g5" class="q-ml-sm q-mr-xs" />
                          <span class="fs-8 text-g5">
                            {{ study.amount }} bloc{{ study.amount > 1 ? 's' : '' }}
                          </span>
                        </q-item-label>

                        <q-item-label caption class="fs-8">
                          {{ study.notAssigned ? 'Blocs de grups no assignats a cap estudi' : study.name }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section v-if="!study.notAssigned" side>
                        <q-badge :label="courseLabels[study.course]" outline color="white" class="q-py-xs" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-tooltip>
              </template>
            </q-item>
          </q-list>
        </div>
      </template>
    </TimeBlockModificationDialogContent>
  </q-dialog>
</template>

<style lang="sass" scoped>
.shared-by-list
  width: 300px
</style>
