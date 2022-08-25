<script setup>
import { ref } from 'vue';

import StudiesDataTable from '@/components/StudiesDataTable.vue';
import DepartmentsDataTable from '@/components/DepartmentsDataTable.vue';
import RoomTypesDataTable from '@/components/RoomTypesDataTable.vue';

const tab = ref('studies');
const splitter = ref(147);
</script>

<template>
  <q-splitter
    v-model="splitter"
    unit="px"
    :limits="[122, 147]"
    class="shadow-5 height-definer width-definer splitter">
    <template #before>
      <q-tabs v-model="tab" vertical class="bg-b4 tabs">
        <q-tab name="studies" icon="school" label="Estudis" />
        <q-tab name="departments" icon="domain" label="Departaments" />
        <q-tab name="labTypes" icon="room" label="Tipus d'aula" />
      </q-tabs>
    </template>

    <template #after>
      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="slide-down"
        transition-next="slide-up"
        class="bg-b7 height-definer panels">
        <q-tab-panel name="studies">
          <div class="q-pa-md">
            <StudiesDataTable />
          </div>
        </q-tab-panel>

        <q-tab-panel name="departments">
          <div class="q-pa-md">
            <DepartmentsDataTable />
          </div>
        </q-tab-panel>

        <q-tab-panel name="labTypes">
          <div class="q-pa-md">
            <RoomTypesDataTable />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-splitter>
</template>

<style lang="sass" scoped>
.height-definer
  height: calc(100vh - 170px)
  min-height: 600px
.width-definer
  min-width: 1300px
  max-width: 2000px
.splitter
  border-radius: 10px
.tabs
  border-radius: 10px 0px 0px 10px
.panels
  border-radius: 0px 10px 10px 0px
</style>
