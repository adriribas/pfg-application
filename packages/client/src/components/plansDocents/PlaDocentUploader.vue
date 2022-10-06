<script setup>
import { ref, watch } from 'vue';

import { usePlaDocent } from '@/composables';
import { useSchoolsStore } from '@/stores';

const emit = defineEmits(['startUpload', 'uploaded']);

const schoolsStore = useSchoolsStore();

const file = ref(null);
const fileToUpload = ref(null);

const { uploading, percentage, error } = usePlaDocent(fileToUpload);

watch(uploading, newUploading => {
  if (newUploading) {
    return emit('startUpload');
  }

  fileToUpload.value = null;
  if (!error.value) {
    emit('uploaded');
  }
});
</script>

<template>
  <div v-auto-animate class="bg-b7 q-pa-xl shadow-5 container">
    <div class="text-h5 q-mb-sm">Pujar un pla docent i inicialitzar el curs acadèmic</div>

    <div class="row justify-center q-mb-lg">
      <div class="text-h6 text-m5 q-py-sm q-px-md bg-b6 course-years">
        {{ schoolsStore.nextStartYear }} - {{ schoolsStore.nextEndYear }}
      </div>
    </div>

    <div v-if="error" class="text-center text-negative">
      S'ha produït un error mentre es pujava el pla docent.
    </div>

    <q-file
      v-model="file"
      label="Seleccionar un fitxer"
      hint="Format: .xlsx"
      accept=".xlsx"
      max-files="1"
      clearable
      clear-icon="close"
      :disable="uploading"
      filled
      dark
      color="m5"
      @update:model-value="error = false"
      class="q-mt-lg">
      <template #prepend>
        <q-icon name="attach_file" />
      </template>
    </q-file>

    <div class="row justify-center">
      <q-btn
        icon="cloud_upload"
        label="Pujar pla docent"
        :disable="!file"
        :loading="uploading"
        :percentage="percentage"
        no-caps
        color="m5"
        @click="fileToUpload = file"
        class="q-mt-lg">
        <template #loading>
          <q-spinner-hourglass class="on-left" />
          Processant fitxer...
        </template>
      </q-btn>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  max-width: 700px
  border-radius: 8px
.course-years
  border-radius: 10px
</style>
