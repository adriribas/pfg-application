<script setup>
import { useConstants } from '@/util';

const props = defineProps({
  study: Object
});

const emit = defineEmits(['select']);

const { courseLabels, semesterLabels } = useConstants();
</script>

<template>
  <div class="q-pa-md shadow-5 bg-b7 container">
    <div class="row flex-center">
      <div class="row q-pa-md shadow-2 text-bold text-m2 bg-b6 header-container">
        <span class="col-auto q-mr-md study-name">Grau en {{ study.name }}</span>

        <q-badge :label="study.abv" outline color="m3" class="col-auto q-py-xs study-abv" />
      </div>
    </div>

    <q-table
      grid
      :rows="study.courses"
      hide-header
      :pagination="{ rowsPerPage: 0 }"
      hide-pagination
      card-container-class="justify-center">
      <template #item="props">
        <div class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-4 q-px-md q-py-sm course-card-container">
          <q-card dark class="bg-b5">
            <q-card-section class="text-center">
              <span class="q-mb-md inline-block text-center text-m1">
                {{ courseLabels[props.row - 1].toUpperCase() }}
              </span>

              <div class="row justify-around q-mb-sm">
                <q-btn
                  v-for="semester in [0, 1]"
                  :label="`${semesterLabels[semester]} Q`"
                  icon="calendar_month"
                  no-caps
                  dense
                  size="0.95em"
                  color="m8"
                  @click="$emit('select', 'view', study.abv, props.row, semester + 1)"
                  class="col-5" />
              </div>

              <div class="row justify-around q-mt-sm">
                <q-btn
                  v-for="semester in [0, 1]"
                  :label="`${semesterLabels[semester]} Q`"
                  icon="edit_calendar"
                  no-caps
                  dense
                  size="0.95em"
                  color="m10"
                  @click="$emit('select', 'edit', study.abv, props.row, semester + 1)"
                  class="col-5" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<style lang="sass" scoped>
.container
  border-radius: 10px
.header-container
  border-radius: 10px
.study-abv
  font-size: 11pt
.study-name
  font-size: 12pt
.course-card-container
  min-width: 250px
  max-width: 300px
</style>
