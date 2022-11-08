<script setup>
import { useConstants } from '@/util';

const props = defineProps({
  study: Object
});

const emit = defineEmits(['select']);

const { courseLabels, semesterLabels } = useConstants();
</script>

<template>
  <div class="shadow-5 bg-b6 container">
    <div class="q-pa-sm shadow-1 bg-b3 header-container">
      <span class="q-mr-sm text-center text-bold text-m2 study-name">Grau en {{ study.name }}</span>

      <q-badge :label="study.abv" outline color="m3" class="q-py-xs study-abv" />
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
          <q-card dark class="bg-b4">
            <q-card-section class="text-center">
              <span class="q-mb-md inline-block text-center text-m1">
                {{ courseLabels[props.row - 1].toUpperCase() }}
              </span>

              <div class="row justify-around">
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
  width: fit-content
  border-radius: 10px 0px 8px 0px
.study-abv
  font-size: 11pt
.study-name
  border-radius: 10px 50px 50px 10px
  font-size: 12pt
.course-card-container
  min-width: 225px
  max-width: 250px
</style>
