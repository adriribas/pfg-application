<script setup>
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import _ from 'lodash';

import { useConstants, useCalendar, useGeneral } from '@/util';

const props = defineProps({
  studyAbv: String,
  subjects: Array,
  timeBlocks: Array
});
defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } = useDialogPluginComponent();
const { groupTypeLabels, pluralizedGroupTypeLabels, timeBlockDefaults } = useConstants();
const { minutesToTime, getEndTime, getStylingGetters } = useCalendar();
const { text } = useGeneral();

const subjectsMod = props.subjects.map(({ groups, ...subjectData }) => ({
  ...subjectData,
  groups: groups.map(({ id, type, number, studies }) => {
    const timeBlocks = props.timeBlocks.filter(({ group }) => group.id === id);
    return {
      id,
      type,
      number,
      timeBlocks,
      studies: !timeBlocks.length ? studies : timeBlocks[0].group.studies
    };
  })
}));
const subject = ref(null);
const groupType = ref('big');
const newTimeBlocks = ref([]);
const removedTimeBlocks = ref([]);

const groupTypeLabel = computed(() => groupTypeLabels[groupType.value]);
const pluralizedGroupTypeLabel = computed(() => pluralizedGroupTypeLabels[groupType.value]);
const getColor = computed(() => getStylingGetters(subject.value ? groupType.value : 'default').getColor);
const subjectGroups = computed(() =>
  !subject.value ? [] : subject.value.groups.filter(({ type }) => type === groupType.value)
);

const findGroup = groupId => subject.value.groups.find(({ id }) => id === groupId);
const addNewTimeBlock = groupId => {
  const group = findGroup(groupId);
  group.timeBlocks.push({ ...timeBlockDefaults[groupType.value], isNew: true });

  const newGroupTimeBlocks = newTimeBlocks.value.find(({ id }) => id === groupId);
  if (!newGroupTimeBlocks) {
    newTimeBlocks.value.push({ subjectCode: subject.value.code, id: groupId, amount: 1 });
  } else {
    newGroupTimeBlocks.amount++;
  }
};
const removeTimeBlock = (groupId, index) => {
  const group = findGroup(groupId);
  const timeBlock = group.timeBlocks[index];

  if (!timeBlock.isNew) {
    removedTimeBlocks.value.push(timeBlock.id);
  } else {
    newTimeBlocks.value.find(({ id }) => id === groupId).amount--;
  }
  group.timeBlocks.splice(index, 1);
};

console.log(subjectsMod);
</script>

<template>
  <q-dialog ref="dialogRef" persistent transition-show="rotate" transition-hide="rotate" @hide="onDialogHide">
    <q-card dark class="bg-b7 dialog-size">
      <q-card-section class="no-padding bg-b10">
        <div class="row justify-center q-py-md">
          <q-select
            v-model="subject"
            label="Escull una assignatura"
            :options="subjectsMod"
            option-label="name"
            map-options
            filled
            dark
            :color="getColor('headerIcons')"
            :label-color="getColor('headerIcons')"
            :input-class="text(getColor('data'))"
            class="col-11">
            <template #option="{ itemProps, opt: { name } }">
              <q-item :="itemProps">
                <q-item-section avatar>
                  <q-avatar icon="auto_stories" />
                </q-item-section>

                <q-item-section :class="[text(getColor('data'))]">
                  <q-item-label>{{ name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <q-tabs
          v-if="subject"
          v-model="groupType"
          :active-color="getColor('headerIcons')"
          active-bg-color="b7"
          indicator-color="transparent">
          <q-tab
            v-for="[type, label] in Object.entries(pluralizedGroupTypeLabels).filter(
              ([type]) => type !== 'generic'
            )"
            :name="type"
            :label="`Grups ${label}`"
            :content-class="type === groupType ? '' : text(getStylingGetters(type).getColor('captions'))"
            class="group-tabs" />
        </q-tabs>
      </q-card-section>

      <q-card-section class="q-mb-xs overflow-auto scroll-area">
        <template v-if="subject">
          <div
            v-if="!subjectGroups.length"
            :class="text(getColor('warning'))"
            class="row flex-center q-mt-md">
            <q-icon name="warning" size="14pt" :color="getColor('warning')" class="q-mr-sm" />
            No existeixen Grups {{ pluralizedGroupTypeLabel }} a {{ subject.name }}.
          </div>

          <div v-else>
            <div v-for="{ id: groupId, number, studies, timeBlocks } in subjectGroups" :key="groupId">
              <q-list v-auto-animate dark :class="[text(getColor('data'))]" class="q-mb-md border-8 bg-b6">
                <div class="row items-center q-pt-md q-pl-md q-pb-xs">
                  <q-badge
                    :label="`Grup ${groupTypeLabel} ${number}`"
                    :color="getColor('detailSubLabelBg')"
                    class="q-py-xs text-bold text-b6" />

                  <template v-if="subject.sharedBy.length > 1">
                    <q-separator vertical :color="getColor('headerIcons')" class="q-mx-sm" />
                    <span v-if="!studies.length">No assignat a cap estudi</span>
                    <template v-else>
                      <template v-for="({ abv }, index) in studies">
                        <q-icon
                          v-if="index"
                          name="circle"
                          size="5pt"
                          :color="getColor('headerIcons')"
                          class="q-mx-sm" />

                        <span v-if="studyAbv !== abv" class="fs-10">{{ abv }}</span>
                        <q-badge
                          v-else
                          :label="abv"
                          outline
                          :color="getColor('captions')"
                          class="q-py-xs fs-10" />
                      </template>
                    </template>
                  </template>
                </div>

                <q-item
                  v-for="({ id: timeBlockId, day, start, duration, week, isNew }, index) in timeBlocks"
                  :key="`${timeBlockId}-${index}`">
                  <div class="row col q-pa-sm border-8 shadow-5 bg-b4">
                    <q-badge
                      v-if="isNew"
                      label="Nou!"
                      floating
                      :color="getColor('newIndicator')"
                      class="q-mt-sm q-mr-md" />

                    <q-item-section side>
                      <q-btn
                        icon="close"
                        size="sm"
                        round
                        unelevated
                        @click="removeTimeBlock(groupId, index)" />
                    </q-item-section>

                    <q-item-section class="col">
                      <div class="row justify-evenly items-center">
                        <div class="row items-center">
                          <q-icon name="today" size="xs" :color="getColor('headerIcons')" class="q-mr-xs" />
                          <template v-if="start">
                            Dilluns
                            <span v-if="week">, {{ week }}</span>
                          </template>
                          <span v-else>No col·locat</span>
                        </div>

                        <div v-if="start" class="row items-center">
                          <q-icon
                            name="schedule"
                            size="xs"
                            :color="getColor('headerIcons')"
                            class="q-ml-md" />
                          <span class="q-ml-xs">{{ start }}h</span>
                          <q-icon name="arrow_right" size="15pt" :color="getColor('headerIcons')" />
                          <span>{{ getEndTime(start, duration) }}h</span>
                        </div>

                        <div class="row items-center">
                          <q-icon
                            name="hourglass_top"
                            size="xs"
                            :color="getColor('headerIcons')"
                            class="q-ml-md" />
                          <span class="q-ml-xs">{{ minutesToTime(duration) }} hores</span>
                        </div>
                      </div>
                    </q-item-section>
                  </div>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-btn
                      icon="add"
                      unelevated
                      :text-color="getColor('headerIcons')"
                      @click="addNewTimeBlock(groupId)"
                      class="border-8 dotted-border add-btn" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right" class="q-mr-xs">
        <q-btn label="Cancel·lar" no-caps unelevated @click="onDialogCancel" />

        <q-btn
          label="Guardar"
          no-caps
          :color="getColor('okBtn')"
          @click="
            onDialogOK({ create: newTimeBlocks.filter(({ amount }) => amount), remove: removedTimeBlocks })
          "
          class="save-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 550px
  max-width: 98vw
  max-height: 90vh
.scroll-area
  height: 708px
  max-height: calc(90vh - 192px)
.group-tabs
  border-radius: 8px 8px 0px 0px
.add-btn
  height: 43px
  margin-left: 2px
  margin-right: 2px
.save-btn
  width: 80px
</style>
