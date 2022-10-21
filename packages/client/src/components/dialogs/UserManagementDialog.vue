<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';

import { authApi, usersApi } from '@/api';
import NewUserDialog from '@/components/dialogs/NewUserDialog.vue';

const props = defineProps({
  users: Array,
  role: String,
  roleLabel: String
});
defineEmits([...useDialogPluginComponent.emits]);

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const columns = [
  { name: 'firstName', field: 'firstName' },
  { name: 'lastName', field: 'lastName' },
  { name: 'email', field: 'email' },
  { name: 'activated', field: 'activated' },
  { name: 'dataEntityAbv', field: row => row.dataEntity?.abv },
  { name: 'dataEntityName', field: row => row.dataEntity?.name }
];

const usersData = ref([
  {},
  ...props.users
    .sort(({ id: id1 }, { id: id2 }) => id2 - id1)
    .map(user => ({ ...user, resending: false, resended: false }))
]);

const newUser = () =>
  $q
    .dialog({ component: NewUserDialog, componentProps: { role: props.role, roleLabel: props.roleLabel } })
    .onOk(({ user }) => (usersData.value = [usersData.value.at(0), user, ...usersData.value.slice(1)]));

const deleteUser = (user, index) =>
  $q
    .dialog({
      title: 'Confirmació',
      message: `Segur que vols eliminar l'usuari <span class="text-bold text-m4">${user.fullName}</span> amb correu electrònic <span class="text-m4">${user.email}</span>?`,
      html: true,
      persistent: true,
      focus: 'none',
      dark: true,
      ok: {
        label: 'Eliminar',
        noCaps: true,
        color: 'negative'
      },
      cancel: {
        label: 'Cancel·lar',
        noCaps: true,
        flat: true,
        textColor: 'white'
      }
    })
    .onOk(async () => {
      try {
        await usersApi.remove(user.id);

        $q.notify({
          type: 'success',
          message: 'Usuari esborrat correctament',
          caption: `${user.fullName} (${user.email})`
        });

        usersData.value.splice(index, 1);
      } catch (e) {
        $q.notify({
          type: 'error',
          message: "Error en l'eliminació de l'usuari",
          caption: e.message
        });
      }
    });

const resendEmailConfirmation = async user => {
  user.resending = true;
  try {
    await authApi.resendEmailConfirmation(user.id);
    user.resended = true;
    setTimeout(() => (user.resended = false), 5000);
    $q.notify({
      type: 'success',
      message: "Correu d'activació reenviat correctament",
      caption: `${user.email} (${user.fullName})`
    });
  } catch (e) {
    $q.notify({
      type: 'error',
      message: "Error en el reenviament del correu d'activació",
      caption: e.message
    });
  }
  user.resending = false;
};
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-route-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <div class="no-overflow dialog-size">
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
                    :label="props.row.dataEntity?.abv || 'No assignat'"
                    :outline="!props.row.dataEntity"
                    color="m6"
                    class="col-auto q-mt-sm q-py-xs">
                    <q-tooltip
                      v-if="props.row.dataEntity"
                      anchor="top middle"
                      self="bottom middle"
                      transition-show="jump-up"
                      transition-hide="jump-down"
                      :class="[!props.row.dataEntity?.name && 'text-warning']"
                      class="text-m12 bg-b4">
                      {{ props.row.dataEntity?.name || 'Nom no especificat' }}
                    </q-tooltip>
                  </q-badge>
                </q-card-section>

                <q-card-actions align="right" :class="!props.row.activated && ['row', 'justify-around']">
                  <q-btn
                    v-if="!props.row.activated"
                    :disable="props.row.resending || props.row.resended"
                    label="Reenviar correu"
                    icon="outgoing_mail"
                    no-caps
                    size="0.9em"
                    dense
                    text-color="warning2"
                    @click="resendEmailConfirmation(props.row)" />

                  <q-btn
                    label="Eliminar"
                    icon="delete"
                    no-caps
                    size="0.9em"
                    dense
                    flat
                    text-color="negative"
                    @click="deleteUser(props.row, props.rowIndex)"
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
