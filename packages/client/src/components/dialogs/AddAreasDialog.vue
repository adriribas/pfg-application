<script setup>
import { ref, watch } from 'vue';
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({ departments: Array, currentAreas: Array });
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const departmentsData = props.departments.map(department => ({
  ...department,
  name: department.name || department.abv,
  areas:
    department.areas?.reduce((accum, area) => {
      const sameArea = props.currentAreas.find(({ abv }) => abv === area.abv);
      if (sameArea && sameArea.departmentAbv === department.abv) {
        return accum;
      }
      return [...accum, { ...area, name: area.name || area.abv }];
    }, []) || []
}));
const areas = ref([]);
const department = ref(null);
const area = ref(null);

watch(department, newDepartment => {
  area.value = newDepartment.areas.length === 1 ? newDepartment.areas[0] : null;
  areas.value = newDepartment.areas;
});
</script>

<template>
  <q-dialog ref="dialogRef" no-route-dismiss @hide="onDialogHide">
    <q-card dark class="dialog-size">
      <q-card-section>
        <q-card-section>
          <q-select
            v-model="department"
            label="Departament"
            :options="departmentsData"
            option-label="name"
            option-value="abv"
            map-options
            dark
            filled
            color="m13"
            class="select-size">
            <template #option="{ itemProps, opt: { abv, name } }">
              <q-item :="itemProps">
                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>
                  <q-item-label caption>{{ name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="area"
            :disable="!department"
            label="Àrea"
            :options="areas"
            option-label="name"
            option-value="abv"
            map-options
            dark
            filled
            color="m13"
            class="select-size">
            <template #option="{ itemProps, opt: { abv, name } }">
              <q-item :="itemProps">
                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>
                  <q-item-label caption>{{ name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template #no-option="{ itemProps }">
              <q-item :="itemProps" dark>
                <q-item-section>
                  <q-item-label caption>No queden àrees per seleccionar d'aquest department.</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel·lar" flat no-caps @click="onDialogCancel" />
        <q-btn
          :disable="!department || !area"
          label="Afegir"
          color="m6"
          no-caps
          @click="onDialogOK({ areaAbv: area.abv, departmentAbv: department.abv })"
          class="q-mr-sm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 550px
  max-width: 90vw
.select-size
  min-width: 260px
</style>
