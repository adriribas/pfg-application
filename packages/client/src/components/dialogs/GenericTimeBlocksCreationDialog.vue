<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

import { useCalendar } from '@/util';
import GenericTimeBlockCreationItem from '@/components/schedule/studies/modification/GenericTimeBlockCreationItem.vue';

const props = defineProps({ timeBlocks: Array });
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } = useDialogPluginComponent();
const { getStylingGetters } = useCalendar();

const { getColor } = getStylingGetters('generic');

const timeBlocksMod = ref(props.timeBlocks.map(timeBlock => ({ ...timeBlock })));
const modTimeBlockIndex = ref(-1);
const creatingTimeBlock = ref(false);
const removedTimeBlocks = ref([]);

const updateTimeBlockData = (index, { label, subLabel, duration }) => {
  timeBlocksMod.value[index].label = label;
  timeBlocksMod.value[index].subLabel = subLabel;
  timeBlocksMod.value[index].duration = duration;
};
const addNewTimeBlock = data => {
  timeBlocksMod.value.unshift({ ...data, create: true });
  creatingTimeBlock.value = false;
};
const modifyTimeBlock = data => {
  updateTimeBlockData(modTimeBlockIndex.value, data);
  timeBlocksMod.value[modTimeBlockIndex.value].mod = true;
  modTimeBlockIndex.value = -1;
};
const removeTimeBlock = index => {
  const timeBlock = timeBlocksMod.value[index];
  if (!timeBlock.create) {
    removedTimeBlocks.value.push(timeBlock.id);
  }
  timeBlocksMod.value.splice(index, 1);
  if (modTimeBlockIndex.value !== -1 && index < modTimeBlockIndex.value) {
    modTimeBlockIndex.value--;
  }
};
</script>

<template>
  <q-dialog
    ref="dialogRef"
    no-backdrop-dismiss
    no-esc-dismiss
    transition-show="rotate"
    transition-hide="rotate"
    @hide="onDialogHide">
    <q-card dark class="bg-b7 dialog-size">
      <q-card-section>
        <div class="overflow-auto scroll-area">
          <q-list v-auto-animate dark>
            <q-item v-if="!creatingTimeBlock">
              <q-item-section>
                <q-btn
                  icon="add"
                  unelevated
                  :text-color="getColor('headerIcons')"
                  @click="creatingTimeBlock = true"
                  class="border-8 dotted-border add-btn" />
              </q-item-section>
            </q-item>

            <GenericTimeBlockCreationItem
              v-else
              create-mode
              @remove="creatingTimeBlock = false"
              @save="addNewTimeBlock" />

            <GenericTimeBlockCreationItem
              v-for="({ id, label, subLabel, day, start, duration, week }, index) in timeBlocksMod"
              :key="id"
              :modify-mode="modTimeBlockIndex === index"
              :is-placed="!!start"
              :label="label"
              :sub-label="subLabel"
              :duration="duration"
              :day="day"
              :start="start"
              :week="week"
              @remove="removeTimeBlock(index)"
              @enable-modify="modTimeBlockIndex = index"
              @save="modifyTimeBlock"
              @cancel-mod="modTimeBlockIndex = -1" />
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-mb-sm q-mr-xs">
        <q-btn label="Cancel·lar" no-caps unelevated @click="onDialogCancel" />

        <q-btn
          label="Guardar"
          no-caps
          :color="getColor('okBtn')"
          @click="
            onDialogOK({
              create: timeBlocksMod.filter(({ create }) => create),
              modify: timeBlocksMod.filter(({ create, mod }) => !create && mod),
              remove: removedTimeBlocks
            })
          "
          class="save-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  min-width: 550px
  max-width: 98vw
  height: 760px
  max-height: 90vh
.scroll-area
  height: 668px
  max-height: calc(90vh - 92px)
.add-btn
  height: 62px
  margin-left: 2px
  margin-right: 2px
.save-btn
  width: 80px
</style>
