<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import DataTableModificationDialogSection from '@/components/dialogs/DataTableModificationDialogSection.vue';
import AddAreasDialog from '@/components/dialogs/AddAreasDialog.vue';

const props = defineProps({
  subject: Object,
  departments: Array,
  labTypes: Array
});
defineEmits([...useDialogPluginComponent.emits]);

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const groups = ref({
  big: props.subject.bigGroups,
  medium: props.subject.mediumGroups,
  small: props.subject.smallGroups
});
const areas = ref(
  props.subject.areas.map(({ abv, name, Department: { abv: departmentAbv, name: departmentName } }) => ({
    abv,
    name,
    departmentAbv,
    departmentName
  }))
);
const labType = ref([...props.subject.labTypes]);

const openAddAreas = () =>
  $q
    .dialog({
      component: AddAreasDialog,
      componentProps: { departments: props.departments, currentAreas: areas.value }
    })
    .onOk(({ areaAbv, departmentAbv }) => {
      if (!areaAbv || !departmentAbv) {
        return;
      }
      const department = props.departments.find(({ abv }) => abv === departmentAbv);
      if (!department || !department.areas) {
        return;
      }
      const area = department.areas.find(({ abv }) => abv === areaAbv);
      if (!area) {
        return;
      }
      areas.value.push({ abv: areaAbv, name: area.name, departmentAbv, departmentName: department.name });
    });
const removeArea = areaAbv => (areas.value = areas.value.filter(({ abv }) => abv !== areaAbv));
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-backdrop-dismiss
    no-route-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <q-card dark class="dialog-size">
      <q-card-section>
        <q-card-section>
          <span class="text-h6 q-mr-md">{{ subject.name }}</span>
          <q-badge outline align="top" color="m13">{{ subject.code }}</q-badge>
        </q-card-section>

        <DataTableModificationDialogSection title="Nombre de grups">
          <div class="row justify-around">
            <StepInput v-model="groups.big" title="Grans" :min="0" :max="99" />
            <StepInput v-model="groups.medium" title="Mitjans" :min="0" :max="99" />
            <StepInput v-model="groups.small" title="Petits" :min="0" :max="99" />
          </div>
        </DataTableModificationDialogSection>

        <DataTableModificationDialogSection title="Àrees">
          <q-list bordered dark v-auto-animate class="rounded-borders">
            <q-item v-for="{ abv, name, departmentAbv, departmentName } in areas" :key="abv">
              <q-item-section side center>
                <q-btn icon="close" size="sm" round unelevated @click="removeArea(abv)" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ abv }}</q-item-label>
                <q-item-label caption :class="[!name && 'text-warning']">
                  {{ name || 'Nom no especificat' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge color="m8" class="q-py-xs q-px-sm">
                  <span>{{ departmentAbv }}</span>

                  <q-tooltip
                    anchor="center left"
                    self="center end"
                    transition-show="jump-left"
                    transition-hide="jump-right"
                    class="text-m12 bg-b4">
                    <span :class="[!departmentName && 'text-warning']">
                      {{ departmentName || 'Nom no especificat' }}
                    </span>
                  </q-tooltip>
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section class="row">
                <div class="col">
                  <q-btn icon="add" unelevated @click="openAddAreas" class="full-width dotted-border" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </DataTableModificationDialogSection>

        <DataTableModificationDialogSection title="Tipus de laboratori">
          <q-select
            label="Seleccionar tipus de laboratori"
            v-model="labType"
            :options="labTypes"
            option-label="name"
            option-value="name"
            map-options
            multiple
            clearable
            stack-label
            use-chips
            filled
            dark
            color="m6">
          </q-select>
        </DataTableModificationDialogSection>
      </q-card-section>

      <q-card-actions align="right" class="q-mb-sm q-mr-xs">
        <q-btn label="Cancel·lar" flat no-caps @click="onDialogCancel" />
        <q-btn
          label="Guardar"
          color="m6"
          no-caps
          @click="
            onDialogOK({
              code: subject.code,
              data: {
                bigGroups: groups.big,
                mediumGroups: groups.medium,
                smallGroups: groups.small,
                areas: areas?.map(({ abv }) => abv) || [],
                labTypes: labType?.map(({ name }) => name) || []
              }
            })
          "
          class="q-mr-sm save-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 700px
  max-width: 90vw
.dotted-border
  border: dashed 0.5px
.save-btn
  width: 80px
</style>

<style lang="sass">
.group-input input
  text-align: center
</style>
