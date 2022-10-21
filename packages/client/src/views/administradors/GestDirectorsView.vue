<script setup>
import { departmentsApi } from '@/api';
import AssignationTable from '@/components/usersManagement/AssignationTable.vue';

const columns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'center' },
  { name: 'name', label: 'Departament', field: 'name', align: 'left' }
];

const loadData = async () => {
  const { data: departments } = await departmentsApi.list({
    params: { fields: 'abv,name,director' }
  });

  return departments;
};

const updateUserAssignation = (departmentAbv, userId = null) =>
  departmentsApi.update(departmentAbv, { director: userId });
</script>

<template>
  <q-page padding>
    <AssignationTable
      row-key="abv"
      role="Director de departament"
      role-label="director de departament"
      pluralized-role-label="directors de departament"
      data-entity-label="dels departaments"
      :data-entity-columns="columns"
      user-label="Director/a"
      user-field="director"
      :data-loader="loadData"
      :user-assignation-updater="updateUserAssignation" />
  </q-page>
</template>

<style lang="sass" scoped></style>
