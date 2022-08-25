<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

import { useAcademicCoursesStore } from '@/stores';
import { studiesApi, subjectsApi, departmentsApi, areasApi } from '@/api';
import AreaDepartmentInline from '@/components/AreaDepartmentInline.vue';
import SubjectModificationDialog from '@/components/dialogs/SubjectModificationDialog.vue';

const $q = useQuasar();
const academicCoursesStore = useAcademicCoursesStore();

const studyColumns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'left' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' }
];
const subjectColumns = [
  { name: 'code', label: 'Codi', field: 'code', align: 'center' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' },
  { name: 'course', label: 'Curs', field: 'course', align: 'center' },
  { name: 'semester', label: 'Quadrimestre', field: 'semester', align: 'center' },
  { name: 'areas', label: 'Àrea', field: 'areas', align: 'center' },
  { name: 'labTypes', label: 'Tipus de laboratori', field: 'labTypes', align: 'center' },
  { name: 'credits', label: 'Crèdits', field: 'credits', align: 'center' },
  { name: 'bigGroups', label: 'Grups grans', field: 'bigGroups', align: 'center' },
  { name: 'mediumGroups', label: 'Grups mitjans', field: 'mediumGroups', align: 'center' },
  { name: 'littleGroups', label: 'Grups petits', field: 'littleGroups', align: 'center' }
];
const data = ref([]);
const loading = ref(false);
const error = ref(false);
const departmentsData = ref([]);

const openSubjectMod = subject =>
  $q
    .dialog({
      component: SubjectModificationDialog,
      componentProps: { subject, departments: departmentsData.value }
    })
    .onOk(() => console.log('Ok'))
    .onCancel(() => console.log('Cancel'))
    .onDismiss(() => console.log('Ok or cancel'));

(async () => {
  const { data: departments } = await departmentsApi.list({
    associations: { academicCourse: academicCoursesStore.selected.startYear }
  });
  const { data: areas } = await areasApi.list({
    filterData: {
      department: departments.map(({ abv }) => abv)
    },
    associations: {
      academicCourse: academicCoursesStore.selected.startYear
    }
  });

  departmentsData.value = areas.reduce((accum, { abv, name, department: departmentAbv }) => {
    const department = accum.find(({ abv }) => abv === departmentAbv);
    if (department) {
      const area = { abv, name };
      if (department.areas) {
        department.areas.push(area);
      } else {
        department.areas = [area];
      }
    }
    return accum;
  }, departments);
})();

(async () => {
  loading.value = true;
  try {
    const { data: studies } = await studiesApi.list({
      associations: { academicCourse: academicCoursesStore.selected.startYear }
    });
    const { data: subjects } = await subjectsApi.list({
      params: { include: 'Area,LabType' },
      associations: {
        academicCourse: academicCoursesStore.selected.startYear,
        study: studies.map(({ abv }) => abv)
      }
    });

    data.value = subjects
      .reduce(
        (
          accum,
          {
            code,
            name,
            semester,
            credits,
            bigGroups,
            mediumGroups,
            littleGroups,
            Studies,
            Areas: areas,
            LabTypes: labTypes
          }
        ) => {
          Studies.forEach(({ abv: studyAbv, StudySubject: { course } }) => {
            const study = accum.find(({ abv }) => abv === studyAbv);
            if (study) {
              const subject = {
                code,
                name,
                course,
                semester,
                credits,
                areas: areas || [],
                labTypes: labTypes || [],
                bigGroups: bigGroups || 0,
                mediumGroups: mediumGroups || 0,
                littleGroups: littleGroups || 0
              };
              if (study.subjects) {
                study.subjects.push(subject);
              } else {
                study.subjects = [subject];
              }
            }
          });
          return accum;
        },
        [...studies]
      )
      .map(study => ({
        ...study,
        name: `Grau en ${study.name}`,
        subjects: study.subjects.sort((s1, s2) => {
          if (s1.course !== s2.course) {
            return s1.course - s2.course;
          }
          if (s1.semester !== s2.semester) {
            return s1.semester - s2.semester;
          }
          return s1.code < s2.code ? -1 : s1.code > s2.code ? 1 : 0;
        })
      }));
  } catch (e) {
    error.value = true;
    data.value = [];
  }

  loading.value = false;
})();
</script>

<template>
  <q-table
    :columns="studyColumns"
    :rows="data"
    row-key="abv"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    :loading="loading"
    loading-label="Carregant les dades dels estudis..."
    flat
    dark
    card-class="bg-b7">
    <template #top>
      <q-icon name="school" size="xl" color="m13" />
      <span class="text-h4 q-ml-md">Estudis i assignatures</span>
    </template>

    <template #header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <template #no-data>
      <div
        :class="!loading && (error ? 'text-negative' : 'text-warning')"
        class="row flex-center q-gutter-sm">
        <q-spinner-hourglass v-if="loading" size="xs" class="on-left" />
        <q-icon v-else :name="error ? 'error' : 'warning'" size="xs" />
        <span>
          {{
            loading
              ? 'Carregant les dades dels estudis...'
              : error
              ? "La informació sobre els estudis no s'ha pogut carregar correctament."
              : 'No hi ha dades sobre els estudis.'
          }}
        </span>
      </div>
    </template>

    <template #body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            @click="props.expand = !props.expand"
            round
            dense
            size="sm"
            color="m8" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
      </q-tr>

      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" no-hover>
          <q-table
            :columns="subjectColumns"
            :rows="props.row.subjects"
            row-key="code"
            :no-data-label="`No hi ha dades sobre les assignatures del ${props.row.name} (${props.row.abv}).`"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            flat
            dark
            card-class="bg-b5">
            <template #header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header">
                  {{ col.label }}
                </q-th>
                <q-th auto-width />
              </q-tr>
            </template>

            <template #body="props">
              <q-tr :props="props" :class="props.row.semester % 2 === 0 ? 'bg-b6' : 'bg-b4'">
                <q-td key="code" :props="props">
                  {{ props.row.code }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="course" :props="props">
                  {{ props.row.course }}
                </q-td>
                <q-td key="semester" :props="props">
                  {{ props.row.semester }}
                </q-td>
                <q-td key="areas" :props="props">
                  <span v-if="!props.row.areas || props.row.areas.length === 0" class="text-negative">
                    -
                  </span>
                  <div v-else>
                    <AreaDepartmentInline
                      v-for="{ abv, name, Department } in props.row.areas"
                      :area="{ abv, name }"
                      :department="Department"
                      :class="[props.row.areas.length > 1 && 'q-my-sm']" />
                  </div>
                </q-td>
                <q-td key="labTypes" :props="props">
                  <span v-if="!props.row.labTypes || props.row.labTypes.length === 0" class="text-warning">
                    -
                  </span>
                  <div v-else>
                    <div
                      v-for="{ name } in props.row.labTypes"
                      :class="[props.row.labTypes.length > 1 && 'q-my-sm']">
                      <span>{{ name }}</span>
                    </div>
                  </div>
                </q-td>
                <q-td key="credits" :props="props">
                  {{ props.row.credits }}
                </q-td>
                <q-td key="bigGroups" :props="props">
                  {{ props.row.bigGroups }}
                </q-td>
                <q-td key="mediumGroups" :props="props">
                  {{ props.row.mediumGroups }}
                </q-td>
                <q-td key="littleGroups" :props="props">
                  {{ props.row.littleGroups }}
                </q-td>
                <q-td auto-width>
                  <q-btn icon="edit" size="sm" color="m8" @click="openSubjectMod(props.row)" />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style lang="sass" scoped>
.table-header
  font-size: 10pt
  font-weight: bold
.area-expansion
  max-width: 150px
</style>
