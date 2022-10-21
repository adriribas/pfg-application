<script setup>
import { studiesApi } from '@/api';
import AssignationTable from '@/components/usersManagement/AssignationTable.vue';

const columns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'center' },
  { name: 'name', label: 'Estudi', field: 'name', align: 'left' }
];

const loadData = async () => {
  const { data: studies } = await studiesApi.list({
    params: { fields: 'abv,name,coordinador' }
  });

  return studies;
};

const updateUserAssignation = (studyAbv, userId = null) =>
  studiesApi.update(studyAbv, { coordinador: userId });
</script>

<template>
  <q-page padding>
    <AssignationTable
      row-key="abv"
      role="Coordinador"
      role-label="coordinador"
      pluralized-role-label="coordinadors"
      data-entity-label="dels estudis"
      :data-entity-columns="columns"
      user-label="Coordinador/a"
      user-field="coordinador"
      :data-loader="loadData"
      :user-assignation-updater="updateUserAssignation" />
  </q-page>
</template>

<style lang="sass" scoped></style>
