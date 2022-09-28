<script setup>
import { ref, watch } from 'vue';

import { usePlaDocent } from '@/composables';
import { useSchoolsStore } from '@/stores';

const emit = defineEmits(['uploaded']);

const schoolsStore = useSchoolsStore();

const file = ref(null);
const fileToUpload = ref(null);

const { uploading, percentage, error } = usePlaDocent(fileToUpload);

watch(uploading, newUploading => {
  if (!newUploading) {
    fileToUpload.value = null;
    if (!error.value) {
      emit('uploaded');
    }
  }
});
</script>

<template>
  <!-- <q-card dark class="q-pa-lg bg-b6">
    <q-card-section class="text-center">
      <div class="text-h5 q-mb-sm">Pujar un pla docent i inicialitzar el curs acadèmic</div>
      <div class="text-h6 text-m5">2022 - 2023</div>
    </q-card-section>

    <q-card-section class="text-center">
      <div v-show="false" class="q-mb-md text-negative">
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
        @update:model-value="error = false">
        <template #prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
    </q-card-section>

    <q-card-actions align="center">
      <q-btn
        icon="cloud_upload"
        label="Pujar pla docent"
        :disable="!file"
        :loading="uploading"
        :percentage="percentage"
        no-caps
        color="m5"
        @click="fileToUpload = file">
        <template #loading>
          <q-spinner-hourglass class="on-left" />
          Processant fitxer...
        </template>
      </q-btn>
    </q-card-actions>
  </q-card> -->

  <div class="q-mt-xl bg-b6 q-pa-xl shadow-5 container">
    <div class="text-center">
      <div class="text-h5 q-mb-sm">Pujar un pla docent i inicialitzar el curs acadèmic</div>

      <div class="text-h6 text-bold text-m5 q-mb-lg">
        {{ schoolsStore.nextStartYear }} - {{ schoolsStore.nextEndYear }}
      </div>

      <div v-show="error" class="text-negative">S'ha produït un error mentre es pujava el pla docent.</div>

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
</style>
