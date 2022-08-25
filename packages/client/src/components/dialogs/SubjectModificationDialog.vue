<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';

import AddAreasDialog from '@/components/dialogs/AddAreasDialog.vue';

const props = defineProps({
  subject: Object,
  departments: Array
});
defineEmits([...useDialogPluginComponent.emits]);

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const groups = ref({
  big: props.subject.bigGroups,
  medium: props.subject.mediumGroups,
  small: props.subject.smallGroups
});
const areas = ref(
  props.subject.areas.map(({ abv, name, Department: { abv: departmentAbv, name: departmentName } }) => ({
    abv,
    name,
    departmentAbv,
    departmentName
  }))
);

const openAddAreas = () =>
  $q
    .dialog({
      component: AddAreasDialog,
      componentProps: {}
    })
    .onOk(() => console.log('Ok'))
    .onCancel(() => console.log('Cancel'))
    .onDismiss(() => console.log('Ok or cancel'));
const removeArea = areaAbv => (areas.value = areas.value.filter(({ abv }) => abv !== areaAbv));
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
          <span class="q-mr-xl text-m8">{{ subject.code }}</span>
          <span class="text-h6">{{ subject.name }}</span>
        </q-card-section>

        <q-card-section class="row items-center">
          <div class="col-4">
            <q-icon name="settings" size="sm" />
            <span class="q-ml-md text-bold">Nombre de grups</span>
          </div>
          <div class="row col justify-center">
            <div class="column col-3 items-center">
              <span class="col q-mb-sm">Grans</span>
              <span class="col">8</span>
            </div>
            <div class="column col-3 items-center">
              <span class="col q-mb-sm">Mitjans</span>
              <span class="col">8</span>
            </div>
            <div class="column col-3 items-center">
              <span class="col q-mb-sm">Petits</span>
              <span class="col">8</span>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="row items-center">
          <div class="col-4">
            <q-icon name="settings" size="sm" />
            <span class="q-ml-md text-bold">Àrees</span>
          </div>

          <div class="col">
            <q-list bordered dark class="rounded-borders">
              <q-item v-for="{ abv, name, departmentAbv, departmentName } in areas" :key="abv">
                <q-item-section side center>
                  <q-btn icon="close" size="sm" round unelevated @click="removeArea(abv)" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>
                  <q-item-label caption :class="[!name && 'text-warning']">
                    {{ name || 'Nom no especificat' }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge color="m8" class="q-py-xs q-px-sm">
                    <span>{{ departmentAbv }}</span>

                    <q-tooltip
                      anchor="center left"
                      self="center end"
                      transition-show="jump-left"
                      transition-hide="jump-right"
                      class="text-m12 bg-b4">
                      <span :class="[!departmentName && 'text-warning']">
                        {{ departmentName || 'Nom no especificat' }}
                      </span>
                    </q-tooltip>
                  </q-badge>
                </q-item-section>
              </q-item>

              <q-item dark>
                <q-item-section class="row">
                  <div class="col">
                    <q-btn icon="add" unelevated @click="openAddAreas" class="full-width dotted-border" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card-section>

      <q-separator color="g10" />

      <q-card-actions align="right">
        <q-btn label="Guardar" color="m6" no-caps @click="onDialogOK" />
        <q-btn label="Cancel·lar" flat no-caps @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 700px
  max-width: 90vw
.select-size
  min-width: 260px
.dotted-border
  border: dashed 0.5px
</style>
