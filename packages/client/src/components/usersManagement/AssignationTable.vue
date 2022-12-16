<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { usersApi } from '@/api';
import UserManagementDialog from '@/components/dialogs/UserManagementDialog.vue';

const props = defineProps({
  rowKey: String,
  role: String,
  roleLabel: String,
  pluralizedRoleLabel: String,
  dataEntityLabel: String,
  dataEntityColumns: Array,
  userLabel: String,
  userField: String,
  dataLoader: Function,
  userAssignationUpdater: Function
});

const $q = useQuasar();

const capRole = _.capitalize(props.roleLabel);
const tableColumns = [
  ...props.dataEntityColumns,
  {
    name: 'user',
    label: props.userLabel,
    field: 'user',
    align: 'center'
  }
];

const usersData = ref([]);
const userSelectOptions = ref([]);
const tableData = ref([]);
const loading = ref(false);
const error = ref(false);

const openUserManagement = () =>
  $q
    .dialog({
      component: UserManagementDialog,
      componentProps: {
        users: usersData.value.map(user => {
          const dataEntity =
            tableData.value.find(({ user: tableUser }) => tableUser && tableUser.id === user.id) || null;
          if (!dataEntity) {
            return { ...user, dataEntity: null };
          }
          return { ...user, dataEntity: _.pick(dataEntity, ['abv', 'name']) };
        }),
        role: props.role,
        roleLabel: props.roleLabel
      }
    })
    .onDismiss(loadData);

const refreshUserSelectOptions = () => {
  userSelectOptions.value = usersData.value.filter(
    ({ id }) => !tableData.value.find(({ user, selectedUser }) => user?.id === id || selectedUser?.id === id)
  );
};

const updateAssignation = async (dataEntity, successMsg, errorMsg) => {
  try {
    await props.userAssignationUpdater(dataEntity[props.rowKey], dataEntity.selectedUser?.id || null);

    $q.notify({
      type: 'success',
      message: successMsg,
      caption: dataEntity.selectedUser?.fullName || dataEntity.user.fullName
    });

    dataEntity.user = dataEntity.selectedUser || null;
    dataEntity.selectedUser = null;
    refreshUserSelectOptions();
  } catch (e) {
    $q.notify({
      type: 'error',
      message: errorMsg,
      caption: e.message
    });
  }
};

const assignUser = dataEntity =>
  updateAssignation(
    dataEntity,
    `${capRole} assignat correctament a ${dataEntity[props.rowKey]}`,
    `Error en l'assignació del ${capRole}`
  );

const unassignUser = dataEntity =>
  updateAssignation(
    dataEntity,
    `${capRole} desassignat correctament de ${dataEntity[props.rowKey]}`,
    `Error en la desassignació del ${capRole}`
  );

const loadData = async () => {
  loading.value = true;
  try {
    const { data: users } = await usersApi.list({
      params: { fields: 'id,firstName,lastName,fullName,email,activated' },
      filterData: { role: props.role }
    });

    const dataEntities = await props.dataLoader();

    tableData.value = dataEntities.map(dataEntity => {
      const userId = dataEntity[props.userField];
      const mappedDataEntity = {
        ...dataEntity,
        user: userId ? users.find(({ id }) => id === userId) : null,
        selectedUser: null
      };

      delete mappedDataEntity[props.userField];

      return mappedDataEntity;
    });

    usersData.value = users;
    refreshUserSelectOptions();
  } catch (e) {
    error.value = true;
  }
  loading.value = false;
};

loadData();
</script>

<template>
  <div class="row justify-center">
    <q-card dark class="col-xl-7 col-lg-9 col-md-11 col-sm-12 q-px-xl q-py-md overflow-auto bg-b7 container">
      <q-card-section>
        <q-table
          :columns="tableColumns"
          :rows="tableData"
          :row-key="rowKey"
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          :loading="loading"
          flat
          dark
          card-class="bg-b7">
          <template #top-left>
            <div class="row items-center">
              <q-icon name="badge" size="xl" color="m13" />

              <span class="text-h4 q-ml-md">Assignació de {{ _.capitalize(pluralizedRoleLabel) }}</span>
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
                    ? `Carregant les dades ${dataEntityLabel}...`
                    : error
                    ? `La informació ${dataEntityLabel} no s'ha pogut carregar correctament.`
                    : `No hi ha dades ${dataEntityLabel}.`
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

              <q-td key="user" :props="props" class="user-column">
                <slot name="user-cell" :q-td-props="props">
                  <q-select
                    v-if="!props.row.user"
                    v-model="props.row.selectedUser"
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
                        :disable="!props.row.selectedUser"
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

                      <span class="q-mr-xs">{{ props.row.user.firstName }} </span>

                      <span class="text-g5">
                        {{ props.row.user.lastName }}
                      </span>
                    </div>

                    <q-btn icon="person_remove" size="sm" color="negative" @click="unassignUser(props.row)" />
                  </div>
                </slot>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="sass" scoped>
.container
  min-width: 1031px
  max-width: 1300px
  height: 90vh
.table-header
  font-size: 10pt
  font-weight: bold
.name-column
  font-size: 10.4pt
.user-column
  width: 400px
.user-select
  width: 400px
.selected-user
  font-size: 10.5pt
</style>
