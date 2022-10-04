<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useSchoolsStore } from '@/stores';
import { studiesApi, usersApi } from '@/api';
import UserManagementDialog from '@/components/dialogs/UserManagementDialog.vue';

const $q = useQuasar();
const schoolsStore = useSchoolsStore();

const columns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'center' },
  { name: 'name', label: 'Estudi', field: 'name', align: 'left' },
  { name: 'coordinador', label: 'Coordinador/a', field: 'coordinador', align: 'center' }
];

const loading = ref(false);
const error = ref(false);
const data = ref([]);
const usersData = ref([]);
const userSelectOptions = ref([]);

const openUserManagement = () =>
  $q
    .dialog({
      component: UserManagementDialog,
      componentProps: {
        users: usersData.value.map(user => {
          const study =
            data.value.find(({ coordinador }) => coordinador && coordinador.id === user.id) || null;
          if (!study) {
            return { ...user, study: null };
          }
          return { ...user, study: _.pick(study, ['abv', 'name']) };
        })
      }
    })
    .onDismiss(loadData);

const refreshUserSelectOptions = () => {
  userSelectOptions.value = usersData.value.filter(
    ({ id }) =>
      data.value.findIndex(
        ({ coordinador, selectedCoordinador }) => coordinador?.id === id || selectedCoordinador?.id === id
      ) === -1
  );
};

const assignUser = async study => {
  try {
    await studiesApi.update(study.abv, { coordinador: study.selectedCoordinador.id });

    $q.notify({
      type: 'success',
      message: `Coordinador assignat correctament a ${study.abv}`,
      caption: study.selectedCoordinador.fullName
    });

    study.coordinador = study.selectedCoordinador;
    study.selectedCoordinador = null;
    refreshUserSelectOptions();
  } catch (e) {
    $q.notify({
      type: 'error',
      message: "Error en l'assignació del coordinador",
      caption: e.message
    });
  }
};
const unassignUser = async study => {
  try {
    await studiesApi.update(study.abv, { coordinador: null });

    $q.notify({
      type: 'success',
      message: `Coordinador desassignat correctament de ${study.abv}`,
      caption: study.coordinador.fullName
    });

    study.coordinador = null;
    study.selectedCoordinador = null;
    refreshUserSelectOptions();
  } catch (e) {
    $q.notify({
      type: 'error',
      message: 'Error en la desassignació del coordinador',
      caption: e.message
    });
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const { data: users } = await usersApi.list({
      params: { fields: 'id,firstName,lastName,fullName,email,activated' },
      filterData: { school: schoolsStore.school.abv, role: 'Coordinador' }
    });
    usersData.value = users;

    const { data: studies } = await studiesApi.list({
      params: { fields: 'abv,name,coordinador' },
      filterData: { school: schoolsStore.school.abv } //Potser s'hauria d'agafar la del currentUser al servidor.
    });
    data.value = studies.map(({ coordinador: coordinadorId, ...study }) => ({
      ...study,
      coordinador: coordinadorId ? usersData.value.find(({ id }) => id === coordinadorId) : null,
      selectedCoordinador: null
    }));

    refreshUserSelectOptions();
  } catch (e) {
    error.value = true;
  }
  loading.value = false;
};

loadData();
</script>

<template>
  <q-page padding>
    <div class="row justify-center">
      <q-card
        dark
        class="col-xl-7 col-lg-9 col-md-11 col-sm-12 q-px-xl q-py-md overflow-auto bg-b7 container">
        <q-card-section>
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
            <template #top-left>
              <div class="row items-center">
                <q-icon name="badge" size="xl" color="m13" />

                <span class="text-h4 q-ml-md">Assignació de Coordinadors</span>
              </div>
            </template>

            <template #top-right>
              <q-btn
                icon="manage_accounts"
                label="Gestió dels usuaris"
                color="m6"
                @click="openUserManagement"
                class="col-auto" />
            </template>

            <template #header-cell="props">
              <q-th :props="props" class="table-header">
                {{ props.col.label }}
              </q-th>
            </template>

            <template #no-data>
              <div
                :class="!loading && (error ? 'text-negative' : 'text-warning')"
                class="row flex-center q-gutter-sm">
                <q-spinner-hourglass v-if="loading" size="xs" class="on-left" />

                <q-icon v-else :name="error ? 'error' : 'warning'" size="xs" />

                <span>
                  {{
                    loading
                      ? 'Carregant les dades dels estudis...'
                      : error
                      ? "La informació dels estudis no s'ha pogut carregar correctament."
                      : 'No hi ha dades sobre els estudis.'
                  }}
                </span>
              </div>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-td key="abv" :props="props">
                  <q-badge :label="props.row.abv" color="m6" class="q-py-xs text-bold" />
                </q-td>

                <q-td key="name" :props="props" class="name-column">
                  {{ props.row.name }}
                </q-td>

                <q-td key="coordinador" :props="props" class="coordinador-column">
                  <q-select
                    v-if="!props.row.coordinador"
                    v-model="props.row.selectedCoordinador"
                    label="Seleccionar usuari"
                    :options="userSelectOptions"
                    option-label="fullName"
                    option-value="id"
                    map-options
                    clearable
                    dense
                    filled
                    dark
                    color="m13"
                    @update:model-value="refreshUserSelectOptions"
                    class="user-select">
                    <template #option="{ itemProps, opt: { firstName, lastName } }">
                      <q-item :="itemProps">
                        <q-item-section avatar>
                          <q-icon name="person" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ firstName }}</q-item-label>
                          <q-item-label caption>{{ lastName }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <template #after>
                      <q-btn
                        :disable="!props.row.selectedCoordinador"
                        icon="person_add"
                        size="sm"
                        color="m8"
                        @click="assignUser(props.row)"
                        class="col-auto q-ml-lg" />
                    </template>

                    <template #no-option="{ itemProps }">
                      <q-item :="itemProps" dark>
                        <q-item-section>
                          <q-item-label caption> No queden més usuaris per assignar. </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                  <div v-else class="row justify-between items-center">
                    <div class="selected-user">
                      <q-icon name="person" size="md" class="q-mr-sm" />

                      <span class="q-mr-xs">{{ props.row.coordinador.firstName }} </span>

                      <span class="text-g5">
                        {{ props.row.coordinador.lastName }}
                      </span>
                    </div>

                    <q-btn icon="person_remove" size="sm" color="negative" @click="unassignUser(props.row)" />
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.container
  max-width: 1300px
  height: 90vh
.table-header
  font-size: 10pt
  font-weight: bold
.user-select
  width: 400px
.name-column
  font-size: 10.4pt
.coordinador-column
  width: 400px
.selected-user
  font-size: 10.5pt
</style>
