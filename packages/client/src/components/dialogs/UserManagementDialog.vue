<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';

import NewUserDialog from '@/components/dialogs/NewUserDialog.vue';

const props = defineProps({
  users: Array
});
defineEmits([...useDialogPluginComponent.emits]);

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const columns = [
  { name: 'firstName', label: 'Nom', field: 'firstName' },
  { name: 'lastName', label: 'Cognoms', field: 'lastName' },
  { name: 'email', label: 'Correu electrònic', field: 'email' },
  { name: 'activated', label: 'Activat', field: 'activated' },
  { name: 'studyAbv', label: "Abreviació de l'estudi", field: row => row.study?.abv },
  { name: 'studyName', label: "Nom de l'estudi", field: row => row.study?.name }
];

const usersData = ref([{}, ...props.users.sort(({ id: id1 }, { id: id2 }) => id2 - id1)]);

const newUser = () =>
  $q
    .dialog({ component: NewUserDialog })
    .onOk(({ user }) => (usersData.value = [usersData.value.at(0), user, ...usersData.value.slice(1)]));
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-route-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <div class="dialog-size no-overflow">
      <q-scroll-area dark class="q-pa-md bg-b6 scroll-area">
        <q-table
          grid
          :columns="columns"
          :rows="usersData"
          row-key="id"
          hide-header
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination>
          <template #item="props">
            <div class="col-md-4 col-sm-6 col-xs-12 q-pa-xs q-mb-xs user-card-container">
              <q-btn
                v-if="!props.rowIndex"
                label="Nou usuari"
                icon="add"
                unelevated
                stack
                text-color="white"
                @click="newUser"
                class="fit dotted-border" />

              <q-card v-else dark class="bg-b8">
                <q-card-section class="column flex-center">
                  <div class="col-auto q-mb-sm">
                    <q-icon name="person" size="xl" />

                    <q-badge
                      v-if="!props.row.activated"
                      align="top"
                      outline
                      color="warning"
                      class="absolute q-ml-xs">
                      <q-icon name="warning" size="1.2em" class="q-mr-xs" />
                      <span class="no-activated-text">No activat</span>
                    </q-badge>
                  </div>

                  <div class="col-auto">{{ props.row.firstName }} {{ props.row.lastName }}</div>

                  <div class="col-auto q-mb-xs text-g5">{{ props.row.email }}</div>

                  <q-badge
                    :label="props.row.study?.abv || 'No assignat'"
                    :outline="!props.row.study"
                    color="m6"
                    class="col-auto q-mt-sm q-py-xs">
                    <q-tooltip
                      v-if="props.row.study"
                      anchor="top middle"
                      self="bottom middle"
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      :class="[!props.row.study?.name && 'text-warning']"
                      class="text-m12 bg-b4">
                      {{ props.row.study?.name || 'Nom no especificat' }}
                    </q-tooltip>
                  </q-badge>
                </q-card-section>

                <q-card-actions align="right" :class="!props.row.activated && ['row', 'justify-around']">
                  <q-btn
                    v-if="!props.row.activated"
                    label="Reenviar correu"
                    icon="outgoing_mail"
                    no-caps
                    size="0.9em"
                    dense
                    flat
                    text-color="warning2" />

                  <q-btn
                    label="Eliminar"
                    icon="delete"
                    no-caps
                    size="0.9em"
                    dense
                    flat
                    text-color="negative"
                    :class="props.row.activated && 'q-mr-sm'" />
                </q-card-actions>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-scroll-area>

      <div class="row justify-end bg-b6">
        <q-btn label="Tancar" no-caps color="m6" @click="onDialogOK" class="q-mr-md q-mb-md" />
      </div>
    </div>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 1000px
  max-width: 90vw
  height: 735px
  max-height: 90vh
.scroll-area
  height: 675px
  max-height: calc(90vh - 60px)
.no-activated-text
  font-size: 8pt
.user-card-container
  height: 207.2px
.dotted-border
  border: dashed 0.5px
</style>
