<script setup>
import { ref } from 'vue';

import { useSchoolsStore } from '@/stores';
import { departmentsApi, areasApi } from '@/api';

const schoolsStore = useSchoolsStore();

const departmentColumns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'left' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' }
];
const areaColumns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'left' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' }
];
const data = ref([]);
const loading = ref(false);
const error = ref(false);

(async () => {
  loading.value = true;

  try {
    const { data: departments } = await departmentsApi.list({
      associations: { school: schoolsStore.school.abv }
    });
    const { data: areas } = await areasApi.list({
      filterData: {
        department: departments.map(({ abv }) => abv)
      },
      associations: {
        academicCourse: { school: schoolsStore.school.abv }
      }
    });

    data.value = areas.reduce((accum, { abv, name, department: departmentAbv }) => {
      const department = accum.find(({ abv }) => abv === departmentAbv);
      if (department) {
        const area = { abv, name };
        if (department.areas) {
          department.areas.push(area);
        } else {
          department.areas = [area];
        }
      }
      return accum;
    }, departments);
  } catch (e) {
    error.value = true;
    data.value = [];
  }

  loading.value = false;
})();
</script>

<template>
  <q-table
    :columns="departmentColumns"
    :rows="data"
    row-key="abv"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    :loading="loading"
    flat
    dark
    card-class="bg-b7">
    <template #top>
      <q-icon name="domain" size="xl" color="m13" />
      <span class="text-h4 q-ml-md">Departaments i àrees</span>
    </template>

    <template #header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <template #no-data>
      <div :class="!loading && (error ? 'text-negative' : 'text-warning')" class="row q-gutter-sm">
        <q-spinner-hourglass v-if="loading" size="xs" class="on-left" />
        <q-icon v-else :name="error ? 'error' : 'warning'" size="xs" />
        <span>
          {{
            loading
              ? 'Carregant les dades dels departaments...'
              : error
              ? "La informació sobre els departaments no s'ha pogut carregar correctament."
              : 'No hi ha dades sobre els departaments.'
          }}
        </span>
      </div>
    </template>

    <template #body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            @click="props.expand = !props.expand"
            round
            dense
            size="sm"
            color="m8" />
        </q-td>
        <q-td key="abv" :props="props">
          {{ props.row.abv }}
        </q-td>
        <q-td key="name" :props="props" :class="!props.row.name && 'text-warning'">
          {{ props.row.name || '-' }}
        </q-td>
      </q-tr>

      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" no-hover>
          <q-table
            :columns="areaColumns"
            :rows="props.row.areas"
            row-key="abv"
            :no-data-label="`No hi ha dades sobre les àrees ${
              props.row.name ? `del departament ${props.row.name} (${props.row.abv})` : `de ${props.row.abv}`
            }.`"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            flat
            dark
            card-class="bg-b5">
            <template #header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-td key="abv" :props="props">
                  {{ props.row.abv }}
                </q-td>
                <q-td key="name" :props="props" :class="!props.row.name && 'text-warning'">
                  {{ props.row.name || '-' }}
                </q-td>
              </q-tr>
            </template>

            <template #no-data="{ icon, message }">
              <div class="row q-gutter-sm text-warning">
                <q-icon :name="icon" size="xs" />
                <span>{{ message }}</span>
              </div>
            </template>
          </q-table>
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
