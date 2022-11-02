<script setup>
import { useAuthStore } from '@/stores';

import HorarisGrausCoordinadorsViewVue from './coordinadors/HorarisGrausCoordinadorsView.vue';
import HorarisGrausDirectorsViewVue from './directors/HorarisGrausDirectorsView.vue';
import HorarisGrausProfessorsView from './professors/HorarisGrausProfessorsView.vue';

const authStore = useAuthStore();

const views = {
  Coordinador: HorarisGrausCoordinadorsViewVue,
  'Director de departament': HorarisGrausDirectorsViewVue,
  Professor: HorarisGrausProfessorsView
};
</script>

<template>
  <q-page padding>
    <Suspense>
      <component :is="views[authStore.role]" />

      <template #fallback>
        <div class="absolute-center">
          <q-spinner-ball size="7em" color="m5" />
        </div>
      </template>
    </Suspense>
  </q-page>
</template>

<style lang="sass" scoped></style>
