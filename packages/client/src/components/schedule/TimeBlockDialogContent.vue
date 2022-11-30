<script setup>
import { useConstants, useGeneral } from '@/util';

const props = defineProps({
  group: Object,
  subject: Object,
  roomType: Object,
  professor: Object,
  getColor: Function,
  getFontSize: Function
});

const { groupTypeLabels } = useConstants();
const { text, bg, pt } = useGeneral();
</script>

<template>
  <q-card dark class="bg-b7 dialog-size">
    <q-card-section class="row justify-between items-start">
      <div class="row">
        <div
          :class="text(getColor('detailTime'))"
          class="text-bold"
          :style="{ 'font-size': pt(getFontSize('detailTime')) }">
          <!-- <div class="row items-center q-mb-sm">
            <q-icon name="today" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />

            <slot name="week-day" />
          </div> -->

          <div class="row items-center">
            <q-icon name="schedule" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />

            <slot name="start-time" />

            <q-icon name="arrow_right" size="15pt" :color="getColor('headerIcons')" class="q-mx-xs" />

            <slot name="end-time" />
          </div>

          <div class="row items-center q-mt-sm">
            <q-icon name="hourglass_top" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />
            <slot name="duration" />
          </div>

          <!-- <div class="row items-center q-mt-sm">
            <q-icon name="today" size="20pt" :color="getColor('headerIcons')" class="q-mr-sm" />

            <slot name="week-day" />
          </div> -->
        </div>

        <q-separator vertical :color="getColor('headerIcons')" class="q-ml-lg q-mr-md" />

        <div class="q-mt-xs">
          <div
            :class="text(getColor('detailSubject'))"
            :style="{ 'font-size': pt(getFontSize('detailSubject')) }">
            {{ subject.name }}
          </div>

          <q-badge
            :label="`Grup ${groupTypeLabels[group.type]} ${group.number}`"
            :color="getColor('detailGroupBg')"
            class="q-mt-sm q-py-xs text-bold text-b7"
            :style="{ 'font-size': pt(getFontSize('detailGroup')) }" />
        </div>
      </div>

      <div class="">
        <slot name="week" />
      </div>
    </q-card-section>

    <q-card-section :class="[text(getColor('data'))]" class="row justify-around q-mx-md">
      <div class="column col-auto">
        <div class="row">
          <q-icon name="room" size="20pt" :color="getColor('headerIcons')" class="q-mr-md" />
          {{ roomType?.name || 'Espai no assignat' }}
        </div>

        <div class="row q-mt-md">
          <q-icon name="domain" size="20pt" :color="getColor('headerIcons')" />

          <q-list bordered dark class="q-ml-md border-8">
            <q-item v-for="{ abv, name, department } in subject.areas">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ abv }}</q-item-label>

                <q-item-label caption :class="[name ? text(getColor('captions')) : 'text-warning']">
                  {{ name || 'Nom no especificat' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge :color="getColor('detailDeptBg')" class="q-ml-sm q-py-xs">
                  <span :class="text(getColor('detailDept'))">{{ department.abv }}</span>

                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    transition-show="jump-right"
                    transition-hide="jump-left"
                    :class="bg(getColor('detailDeptBg'))">
                    <span :class="text(getColor('detailDept'))">{{ department.name }}</span>
                  </q-tooltip>
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <div class="column col-auto">
        <div class="row">
          <q-icon name="person" size="20pt" :color="getColor('headerIcons')" class="q-mr-md" />
          {{ professor?.fullName || 'Professor no assignat' }}
        </div>

        <div v-if="subject.sharedBy.length > 1" class="row q-mt-md">
          <q-icon name="school" size="20pt" :color="getColor('headerIcons')" class="q-mr-md" />

          <slot name="sharing" />
        </div>

        <div v-if="group.type === 'small'" class="row q-mt-md">
          <q-icon name="science" size="20pt" :color="getColor('headerIcons')" />

          <q-list bordered dense dark class="col q-ml-md border-8">
            <q-item v-for="{ name } in subject.labTypes">
              <q-item-section>
                <q-item-label :class="[text(getColor('data'))]">{{ name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
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
