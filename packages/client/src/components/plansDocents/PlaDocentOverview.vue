<script setup>
import { ref } from 'vue';

import StudiesDataTable from '@/components/StudiesDataTable.vue';
import DepartmentsDataTable from '@/components/DepartmentsDataTable.vue';
import RoomTypesDataTable from '@/components/RoomTypesDataTable.vue';

const currentTab = ref(0);
const splitter = ref(147);

const tabs = [
  { label: 'Estudis', icon: 'school', component: StudiesDataTable },
  { label: 'Departaments', icon: 'domain', component: DepartmentsDataTable },
  { label: "Tipus d'aula", icon: 'room', component: RoomTypesDataTable }
];
</script>

<template>
  <q-splitter
    v-model="splitter"
    unit="px"
    :limits="[122, 147]"
    class="shadow-5 height-definer width-definer splitter">
    <template #before>
      <q-tabs v-model="currentTab" vertical class="bg-b4 tabs">
        <q-tab v-for="({ label, icon }, index) in tabs" :name="index" :icon="icon" :label="label" />
      </q-tabs>
    </template>

    <template #after>
      <q-tab-panels
        v-model="currentTab"
        animated
        swipeable
        vertical
        transition-prev="slide-down"
        transition-next="slide-up"
        class="bg-b7 height-definer panels">
        <q-tab-panel v-for="({ component }, index) in tabs" :name="index">
          <div class="q-pa-md">
            <component :is="component" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-splitter>
</template>

<style lang="sass" scoped>
.height-definer
  height: calc(100vh - 155px)
  min-height: 600px
.width-definer
  min-width: 1200px
  max-width: 98vw
.splitter
  border-radius: 10px
.tabs
  border-radius: 10px 0px 0px 10px
.panels
  border-radius: 0px 10px 10px 0px
</style>
