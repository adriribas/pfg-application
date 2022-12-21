<script setup>
import { useGeneral } from '@/util';

const props = defineProps({
  getColor: Function,
  getFontSize: Function
});

const { text, pt } = useGeneral();

const getContainerProps = margin => ({ class: `row ${margin ? 'q-mt-md' : ''}` });
const getIconProps = name => ({ name, size: '20pt', color: props.getColor('headerIcons'), class: 'q-mr-md' });
</script>

<template>
  <q-card dark class="bg-b7 dialog-size">
    <q-card-section class="row justify-between items-start">
      <div class="row">
        <div
          :class="text(getColor('detailTime'))"
          class="text-bold"
          :style="{ fontSize: pt(getFontSize('detailTime')) }">
          <div class="row items-center q-mt-sm">
            <q-icon name="schedule" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />
            <slot name="start-time" />

            <q-icon name="arrow_right" size="15pt" :color="getColor('headerIcons')" class="q-mx-xs" />
            <slot name="end-time" />
          </div>

          <div class="row items-center q-mt-sm">
            <q-icon name="hourglass_top" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />
            <slot name="duration" />
          </div>
        </div>

        <q-separator vertical :color="getColor('headerIcons')" class="q-ml-lg q-mr-md" />

        <div class="q-mt-xs">
          <slot
            name="label"
            :container-props="{
              class: text(getColor('detailLabel')),
              style: { fontSize: pt(getFontSize('detailLabel')) }
            }">
          </slot>

          <slot
            name="sub-label"
            :badge-props="{
              color: getColor('detailSubLabelBg'),
              class: 'q-mt-sm q-py-xs text-bold text-b7',
              style: { fontSize: pt(getFontSize('detailSubLabel')) }
            }">
          </slot>
        </div>
      </div>

      <slot name="week" />
    </q-card-section>

    <q-card-section class="row flex-center no-padding">
      <slot name="week-day" :icon-props="getIconProps('calendar_today')" />
    </q-card-section>

    <q-card-section :class="[text(getColor('data'))]" class="row justify-around q-mx-md q-mt-md">
      <div class="column col-auto">
        <slot name="room-type" :container-props="getContainerProps()" :icon-props="getIconProps('room')" />

        <slot name="areas" :container-props="getContainerProps(true)" :icon-props="getIconProps('domain')" />
      </div>

      <div class="column col-auto">
        <slot name="professor" :container-props="getContainerProps()" :icon-props="getIconProps('person')" />

        <slot
          name="sharing"
          :container-props="getContainerProps(true)"
          :icon-props="getIconProps('school')" />

        <slot
          name="lab-types"
          :container-props="getContainerProps(true)"
          :icon-props="getIconProps('science')" />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-mb-sm q-mr-xs">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<style lang="sass" scoped>
.dialog-size
  width: 800px
  max-width: 100vw
</style>
