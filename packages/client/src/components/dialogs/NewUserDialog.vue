<script setup>
import { ref } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import { usersApi } from '@/api/index.js';

const props = defineProps({
  role: String,
  roleLabel: String
});
defineEmits([...useDialogPluginComponent.emits]);

const $q = useQuasar();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const creating = ref(false);
const form = ref(null);
const firstName = ref('');
const lastName = ref('');
const email = ref('');

const capRole = _.capitalize(props.roleLabel);

const createUser = async () => {
  creating.value = true;
  try {
    const { data: user } = await usersApi.create({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      role: props.role
    });

    $q.notify({
      type: 'success',
      message: 'Usuari creat correctament',
      caption: `${user.fullName} (${user.email})`
    });
    onDialogOK({ user });
  } catch (e) {
    $q.notify({
      type: 'error',
      message: "Error en la creació de l'usuari",
      caption: e.response?.data.message || e.message
    });
  }
  creating.value = false;
};
</script>

<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss no-route-dismiss @hide="onDialogHide">
    <q-card dark class="q-pa-sm dialog-size">
      <q-card-section class="text-h5 text-center">
        <div class="q-mb-sm text-h5">Nou usuari</div>

        <div class="row justify-center">
          <span class="q-py-xs q-px-md text-h5 bg-b4 text-m5 role-text">{{ capRole }}</span>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form ref="form" autofocus greedy @submit="createUser" class="q-gutter-md">
          <q-input
            v-model="firstName"
            autofocus
            label="Nom"
            lazy-rules
            :rules="[val => !!val]"
            no-error-icon
            error-message="Aquest camp és obligatori"
            filled
            dark
            color="m14" />

          <q-input
            v-model="lastName"
            label="Cognoms"
            lazy-rules
            :rules="[val => !!val]"
            no-error-icon
            error-message="Aquest camp és obligatori"
            filled
            dark
            color="m14" />

          <q-input
            v-model="email"
            label="Correu electrònic"
            lazy-rules
            :rules="[val => !!val]"
            no-error-icon
            error-message="Aquest camp és obligatori"
            filled
            dark
            @keypress.enter.prevent="$refs['form'].submit()"
            color="m14" />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :disable="creating" label="Cancel·lar" flat no-caps @click="onDialogCancel" />

        <q-btn
          :loading="creating"
          label="Crear"
          color="m6"
          no-caps
          @click="$refs['form'].submit()"
          class="q-mr-sm creation-btn">
          <template #loading>
            <q-spinner-hourglass />
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 400px
  max-width: 90vw
.creation-btn
  width: 80px
.role-text
  border-radius: 8px
</style>
