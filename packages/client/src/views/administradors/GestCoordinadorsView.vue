<script setup>
import { studiesApi } from '@/api';
import MainCard from '@/components/usersManagement/AssignationTable.vue';

const columns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'center' },
  { name: 'name', label: 'Estudi', field: 'name', align: 'left' }
];

const loadData = async users => {
  const { data: studies } = await studiesApi.list({
    params: { fields: 'abv,name,coordinador' }
  });

  const data = studies.map(({ coordinador: coordinadorId, ...study }) => ({
    ...study,
    user: coordinadorId ? users.find(({ id }) => id === coordinadorId) : null,
    selectedUser: null
  }));

  return data;
};

const updateUserAssignation = (studyAbv, userId = null) =>
  studiesApi.update(studyAbv, { coordinador: userId });
</script>

<template>
  <q-page padding>
    <MainCard
      rowKey="abv"
      role="coordinador"
      pluralized-role="coordinadors"
      data-entity-label="dels estudis"
      :data-entity-columns="columns"
      user-label="Coordinador/a"
      user-field="coordinador"
      :data-loader="loadData"
      :user-assignation-updater="updateUserAssignation" />
  </q-page>
</template>

<style lang="sass" scoped></style>
