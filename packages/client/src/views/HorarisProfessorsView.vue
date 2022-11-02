<script setup>
import { useAuthStore } from '@/stores';

import HorarisProfessorsCoordinadorsView from './coordinadors/HorarisProfessorsCoordinadorsView.vue';
import HorarisProfessorsDirectorsView from './directors/HorarisProfessorsDirectorsView.vue';
import HorarisProfessorsResponsablesView from './responsables/HorarisProfessorsResponsablesView.vue';

const authStore = useAuthStore();

const views = {
  Coordinador: HorarisProfessorsCoordinadorsView,
  'Director de departament': HorarisProfessorsDirectorsView,
  Professor: HorarisProfessorsResponsablesView
};
</script>

<template>
  <q-page padding>
    <Suspense>
      <component :is="views[authStore.role]" />

      <template #fallback>
        <ViewLoadingSpinner />
      </template>
    </Suspense>
  </q-page>
</template>

<style lang="sass" scoped></style>
