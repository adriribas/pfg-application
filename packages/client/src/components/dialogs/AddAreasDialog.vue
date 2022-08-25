<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const department = ref(null);
const departments = ref([]);
</script>

<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss no-route-dismiss @hide="onDialogHide">
    <q-card dark class="">
      <q-card-section>
        <q-card-section> </q-card-section>
        <q-card-section>
          <q-select
            v-model="department"
            label="Departament"
            :options="departments"
            option-label="abv"
            option-value="name"
            map-options
            dark
            outlined
            color="m13"
            class="select-size">
            <template #option="{ itemProps, opt: { abv, name } }">
              <q-item :="itemProps">
                <q-item-section>
                  <q-item-label>{{ abv }}</q-item-label>
                  <q-item-label caption>{{ name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="department"
            label="Àrea"
            :options="departments"
            option-label="abv"
            option-value="name"
            emit-value
            map-options
            dark
            outlined
            class="select-size">
            <template #option="scope">
              <q-item :="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.abv }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card-section>

      <q-separator color="g10" />

      <q-card-actions align="right">
        <q-btn label="Afegir" color="m6" no-caps @click="onDialogOK" />
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
</style>
