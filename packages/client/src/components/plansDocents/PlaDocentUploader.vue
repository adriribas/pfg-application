<script setup>
import { ref, watch } from 'vue';

import { usePlaDocent } from '@/composables';

const emit = defineEmits(['uploaded']);

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
  <div class="bg-b6 q-pa-xl shadow-5 container">
    <div class="q-gutter-y-xl text-center">
      <div class="text-h5">Pujar un pla docent i inicialitzar el curs acadèmic</div>

      <div v-if="error" class="text-negative error-msg">
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
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  max-width: 700px
  border-radius: 8px
.error-msg
  margin-top: 20px
  margin-bottom: -30px
</style>
