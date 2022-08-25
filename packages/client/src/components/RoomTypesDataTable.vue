<script setup>
import { ref } from 'vue';

import { useAcademicCoursesStore } from '@/stores';
import {} from '@/api';

const academicCoursesStore = useAcademicCoursesStore();

const columns = [];
const data = ref([]);
const loading = ref(false);
const error = ref(false);
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
  </q-table>
</template>

<style lang="sass" scoped>
.table-header
  font-size: 10pt
  font-weight: bold
</style>
