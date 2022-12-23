<script setup>
import { useQuasar } from 'quasar';

import { useAuthStore } from '@/stores';

const $q = useQuasar();
const authStore = useAuthStore();

const logout = () =>
  $q
    .dialog({
      title: 'Confirmació',
      message: 'Segur que vols tancar la sessió?',
      focus: 'none',
      dark: true,
      ok: {
        label: 'Sí',
        noCaps: true,
        color: 'm9'
      },
      cancel: {
        label: 'Cancel·lar',
        noCaps: true,
        flat: true,
        textColor: 'white'
      }
    })
    .onOk(authStore.logout);
</script>

<template>
  <q-tabs
    v-if="authStore.isLoggedIn"
    no-caps
    inline-label
    outside-arrows
    align="left"
    narrow-indicator
    indicator-color="m14">
    <q-route-tab
      v-for="tab in authStore.tabs"
      :key="tab.routeName"
      :to="{ name: tab.routeName }"
      :label="tab.title" />

    <q-space />

    <q-icon name="person" size="sm" />

    <span class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center text-bold">
      {{ authStore.fullName }}
    </span>

    <q-icon name="circle" size="5pt" color="m8" />

    <span
      class="q-tab q-tab--no-caps relative-position self-stretch flex flex-center text-center fs-11 text-m8">
      {{ authStore.role }}
    </span>

    <q-btn
      no-caps
      dense
      :padding="$q.screen.gt.sm ? '1px 7px' : ''"
      color="m9"
      @click="logout"
      class="q-ml-sm logout-btn">
      <q-icon name="power_settings_new" size="13pt" />

      <span v-if="$q.screen.gt.sm" class="q-ml-xs fs-10">Sortir</span>
    </q-btn>
  </q-tabs>
</template>

<style lang="sass" scoped>
.separator
  font-size: 15pt
.role
  font-size: 10pt
.logout-btn
  margin-right: 12px
</style>
