<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import {} from '@/stores';
import { labTypesApi } from '@/api';
import LabTypeModificationDialog from '@/components/dialogs/LabTypeModificationDialog.vue';

const $q = useQuasar();

const columns = [
  { name: 'name', label: 'Nom', field: 'name', align: 'left' },
  { name: 'capacity', label: "Capacitat d'alumnes", field: 'capacity', align: 'center' }
];

const data = ref([]);
const loading = ref(false);
const error = ref(false);

const openLabTypeMod = labType =>
  $q
    .dialog({ component: LabTypeModificationDialog, componentProps: { labType } })
    .onOk(async ({ name, data: labTypeData }) => {
      try {
        const { data: newLabType } = await labTypesApi.update(name, labTypeData);

        $q.notify({
          type: 'success',
          message: "Tipus d'aula modificat correctament",
          caption: newLabType.name
        });

        const labTypeIndex = data.value.findIndex(labType => labType.name === name);
        if (labTypeIndex !== -1) {
          data.value[labTypeIndex] = newLabType;
        }
      } catch (e) {
        $q.notify({
          type: 'error',
          message: "Error en la modificació del tipus d'aula",
          caption: e.message
        });
      }
    });

(async () => {
  loading.value = true;
  try {
    const { data: labTypes } = await labTypesApi.list();
    data.value = labTypes.map(({ name, capacity }) => ({ name, capacity }));
  } catch (e) {
    error.value = true;
  }
  loading.value = false;
})();
</script>

<template>
  <q-table
    :columns="columns"
    :rows="data"
    row-key="abv"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    :loading="loading"
    flat
    dark
    card-class="bg-b7">
    <template #top>
      <q-icon name="room" size="xl" color="m13" />
      <span class="text-h4 q-ml-md">Tipus d'aula</span>
    </template>

    <template #header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header">
          {{ col.label }}
        </q-th>
        <q-th auto-width />
      </q-tr>
    </template>

    <template #no-data>
      <div :class="!loading && (error ? 'text-negative' : 'text-warning')" class="row q-gutter-sm">
        <q-spinner-hourglass v-if="loading" size="xs" class="on-left" />
        <q-icon v-else :name="error ? 'error' : 'warning'" size="xs" />
        <span>
          {{
            loading
              ? "Carregant les dades dels tipus d'aula..."
              : error
              ? "La informació sobre els tipus d'aula no s'ha pogut carregar correctament."
              : "No hi ha dades sobre els tipus d'aula."
          }}
        </span>
      </div>
    </template>

    <template #body="props">
      <q-tr>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">{{ col.value }}</q-td>
        <q-td auto-width>
          <q-btn icon="edit" size="sm" color="m8" @click="openLabTypeMod(props.row)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style lang="sass" scoped>
.table-header
  font-size: 10pt
  font-weight: bold
</style>
