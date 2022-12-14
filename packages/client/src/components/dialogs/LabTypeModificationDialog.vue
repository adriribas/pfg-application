<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import DataTableModificationDialogSection from '@/components/dialogs/DataTableModificationDialogSection.vue';

const props = defineProps({
  labType: Object
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const amount = ref(props.labType.amount);
const capacity = ref(props.labType.capacity);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-backdrop-dismiss
    no-route-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <q-card dark class="dialog-size">
      <q-card-section>
        <q-card-section>
          <span class="text-h6 q-mr-md">{{ labType.name }}</span>
        </q-card-section>

        <DataTableModificationDialogSection title="Quantitat d'aules">
          <div class="row justify-around">
            <StepInput v-model="amount" :min="0" :max="999" />
          </div>
        </DataTableModificationDialogSection>

        <DataTableModificationDialogSection title="Capacitat d'alumnes">
          <div class="row justify-around">
            <StepInput v-model="capacity" :min="0" :max="999" />
          </div>
        </DataTableModificationDialogSection>
      </q-card-section>

      <q-card-actions align="right" class="q-mb-sm q-mr-xs">
        <q-btn label="Cancel·lar" flat no-caps @click="onDialogCancel" />
        <q-btn
          label="Guardar"
          color="m6"
          no-caps
          @click="
            onDialogOK({
              name: labType.name,
              data: {
                amount,
                capacity
              }
            })
          "
          class="q-mr-sm save-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 600px
  max-width: 90vw
.save-btn
  width: 80px
</style>

<style lang="sass">
.group-input input
  text-align: center
</style>
