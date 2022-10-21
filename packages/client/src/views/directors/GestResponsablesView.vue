<script setup>
import { areasApi } from '@/api';
import AssignationTable from '@/components/usersManagement/AssignationTable.vue';

const columns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'center' },
  { name: 'name', label: 'Àrea', field: 'name', align: 'left' }
];

const loadData = async () => {
  const { data: areas } = await areasApi.list({
    params: { fields: 'abv,name,responsable' }
  });

  return areas;
};

const updateUserAssignation = (areaAbv, userId = null) => areasApi.update(areaAbv, { responsable: userId });
</script>

<template>
  <q-page padding>
    <AssignationTable
      row-key="abv"
      role="Responsable de docencia"
      role-label="responsable de docència"
      pluralized-role-label="responsables de docència"
      data-entity-label="de les àrees"
      :data-entity-columns="columns"
      user-label="Responsable"
      user-field="responsable"
      :data-loader="loadData"
      :user-assignation-updater="updateUserAssignation" />
  </q-page>
</template>

<style lang="sass" scoped></style>
