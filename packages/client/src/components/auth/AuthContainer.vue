<script setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';

defineProps({
  title: String,
  navText: String,
  navLinkText: String,
  navRoute: String
});

const $q = useQuasar();

const containerSize = computed(() => ($q.screen.lt.sm ? 'fit' : ''));
const containerXPadding = computed(() => `q-px-${$q.screen.lt.lg ? 'lg' : 'xl'}`);
</script>

<template>
  <div class="row flex-center fit absolute-center">
    <div
      :class="[containerSize, containerXPadding]"
      class="col-xl-3 col-lg-4 col-md-5 col-sm-6 col-xs-12 q-py-xl shadow-5 text-center bg-b7 container">
      <div class="q-mb-md q-mt-md text-h3">{{ title }}</div>

      <div class="q-mb-xl inline-block q-py-xs q-px-md text-h5 text-bold bg-b4 text-m5 app-name-text">
        SCHEDY
      </div>

      <div class="q-mb-lg">
        <slot />
      </div>

      <div class="q-mb-sm">{{ navText }}</div>

      <router-link :to="{ name: navRoute }" class="text-m8 link">{{ navLinkText }}</router-link>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  body.screen--xs &
    min-width: auto
    max-width: 100%
    border-radius: 0
  min-width: 442px
  max-width: 500px
  border-radius: 10px
.app-name-text
  border-radius: 8px
.link:hover
  filter: brightness(1.3)
.link:focus
  filter: brightness(2)
</style>
