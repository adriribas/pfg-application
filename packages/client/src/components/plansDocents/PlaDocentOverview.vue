<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import StudiesDataTable from '@/components/StudiesDataTable.vue';
import DepartmentsDataTable from '@/components/DepartmentsDataTable.vue';
import RoomTypesDataTable from '@/components/RoomTypesDataTable.vue';

const $q = useQuasar();

const currentTab = ref(0);
const breakpoint = computed(() => ['lg', 'sm', 'sm'][currentTab.value]);
const splitter = computed(() => ($q.screen.lt[breakpoint.value] ? 70 : 147));

const tabs = [
  { label: 'Estudis', icon: 'school', component: StudiesDataTable },
  { label: 'Departaments', icon: 'domain', component: DepartmentsDataTable },
  { label: "Tipus d'aula", icon: 'room', component: RoomTypesDataTable }
];
</script>

<template>
  <q-splitter v-model="splitter" unit="px" :limits="[70, 147]" class="full-height shadow-5 splitter">
    <template #before>
      <q-tabs v-model="currentTab" vertical class="bg-b4 tabs">
        <q-tab
          v-for="({ label, icon }, index) in tabs"
          :name="index"
          :icon="icon"
          :label="$q.screen.lt[breakpoint] ? '' : label" />
      </q-tabs>
    </template>

    <template #after>
      <q-tab-panels
        v-model="currentTab"
        vertical
        animated
        transition-prev="slide-down"
        transition-next="slide-up"
        class="full-height bg-b7 panels">
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
.splitter
  border-radius: 10px
.tabs
  border-radius: 10px 0px 0px 10px
.panels
  border-radius: 0px 10px 10px 0px
</style>
