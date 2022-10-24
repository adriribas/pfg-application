<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import { studiesApi, subjectsApi, departmentsApi, areasApi, labTypesApi } from '@/api';
import AreaDepartmentInline from '@/components/AreaDepartmentInline.vue';
import SubjectModificationDialog from '@/components/dialogs/SubjectModificationDialog.vue';

const $q = useQuasar();

const studyColumns = [
  { name: 'abv', label: 'Abreviació', field: 'abv', align: 'left' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' }
];
const labels = computed(() =>
  $q.screen.lt.xl
    ? {
        semester: 'Quad.',
        labTypes: 'Tipus lab.',
        bigGroups: 'G. grans',
        mediumGroups: 'G. mitjans',
        smallGroups: 'G. petits'
      }
    : {
        semester: 'Quadrimestre',
        labTypes: 'Tipus de laboratori',
        bigGroups: 'Grups grans',
        mediumGroups: 'Grups mitjans',
        smallGroups: 'Grups petits'
      }
);
const subjectColumns = computed(() => [
  { name: 'code', label: 'Codi', field: 'code', align: 'center' },
  { name: 'name', label: 'Nom', field: 'name', align: 'left' },
  { name: 'semester', label: labels.value.semester, field: 'semester', align: 'center' },
  { name: 'credits', label: 'Crèdits', field: 'credits', align: 'center' },
  { name: 'areas', label: 'Àrees', field: 'areas', align: 'center' },
  { name: 'labTypes', label: labels.value.labTypes, field: 'labTypes', align: 'center' },
  { name: 'bigGroups', label: labels.value.bigGroups, field: 'bigGroups', align: 'center' },
  { name: 'mediumGroups', label: labels.value.mediumGroups, field: 'mediumGroups', align: 'center' },
  { name: 'smallGroups', label: labels.value.smallGroups, field: 'smallGroups', align: 'center' }
]);
const courseNames = ['Primer', 'Segon', 'Tercer', 'Quart', 'Cinquè', 'Sisè', 'Setè', 'Vuitè'];

const data = ref([]);
const loading = ref(false);
const error = ref(false);
const departmentsData = ref([]);
const labTypesData = ref([]);

const openSubjectMod = subject =>
  $q
    .dialog({
      component: SubjectModificationDialog,
      componentProps: { subject, departments: departmentsData.value, labTypes: labTypesData.value }
    })
    .onOk(async ({ code, data: subjectData }) => {
      try {
        const {
          data: { Areas: areas, LabTypes: labTypes, ...newSubject }
        } = await subjectsApi.update(code, subjectData);

        $q.notify({
          type: 'success',
          message: 'Assignatura modificada correctament',
          caption: newSubject.name
        });

        let updated = false;
        const studies = data.value;
        let i = 0;
        while (!updated && i < studies.length) {
          const studyCourses = studies[i].subjects;
          let j = 0;
          while (!updated && j < studyCourses.length) {
            const subjects = studyCourses[j];
            let k = 0;
            while (!updated && k < subjects.length) {
              if (subjects[k].code === code) {
                subjects[k] = { areas, labTypes, ...newSubject };
                updated = true;
              }
              k++;
            }
            j++;
          }
          i++;
        }
      } catch (e) {
        $q.notify({
          type: 'error',
          message: "Error en la modificació de l'assignatura",
          caption: e.message
        });
      }
    });

const reduceSubjectName = name =>
  name.split(' ').reduce((accum, word) => `${accum} ${word.length < 5 ? word : `${word.slice(0, 4)}.`}`, '');

(async () => {
  loading.value = true;
  try {
    const { data: studies } = await studiesApi.list({
      params: { fields: 'abv,name' }
    });
    const { data: subjects } = await subjectsApi.list({
      params: {
        fields: 'code,name,semester,credits,bigGroups,mediumGroups,smallGroups',
        include: 'Area,LabType'
      },
      associations: {
        study: studies.map(({ abv }) => abv)
      }
    });

    data.value = subjects
      .reduce(
        (accum, { Studies, Areas, LabTypes, ...subjectData }) => {
          Studies.forEach(({ abv: studyAbv, StudySubject: { course } }) => {
            const study = accum.find(({ abv }) => abv === studyAbv);

            if (study) {
              const subject = { ...subjectData, areas: Areas || [], labTypes: LabTypes || [] };

              if (!study.subjects) {
                study.subjects = [];
              }
              if (!study.subjects[course - 1]) {
                study.subjects[course - 1] = [subject];
              } else {
                study.subjects[course - 1].push(subject);
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
        selectedCourse: 0,
        subjects: study.subjects.map(courseSubjects =>
          courseSubjects.sort((s1, s2) => {
            if (s1.semester !== s2.semester) {
              return s1.semester - s2.semester;
            }
            return s1.code < s2.code ? -1 : s1.code > s2.code ? 1 : 0;
          })
        )
      }));
  } catch (e) {
    error.value = true;
    data.value = [];
  }
  loading.value = false;

  const { data: departments } = await departmentsApi.list({
    params: { fields: 'abv,name' }
  });
  const { data: areas } = await areasApi.list({
    params: { fields: 'abv,name,department' },
    filterData: { department: departments.map(({ abv }) => abv) }
  });
  const { data: labTypes } = await labTypesApi.list({
    params: { fields: 'name' }
  });

  departmentsData.value = areas.reduce((accum, { department: departmentAbv, ...areaData }) => {
    const department = accum.find(({ abv }) => abv === departmentAbv);

    if (department) {
      const area = areaData;

      if (department.areas) {
        department.areas.push(area);
      } else {
        department.areas = [area];
      }
    }

    return accum;
  }, departments);

  labTypesData.value = [...labTypes];
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
      <div v-if="!loading" :class="error ? 'text-negative' : 'text-warning'" class="row">
        <q-icon :name="error ? 'error' : 'warning'" size="xs" />

        {{
          error
            ? "La informació sobre els estudis no s'ha pogut carregar correctament."
            : 'No hi ha dades sobre els estudis.'
        }}
      </div>
    </template>

    <template #body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn
            :icon="`expand_${props.expand ? 'less' : 'more'}`"
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

      <q-tr v-if="props.expand" :props="props">
        <q-td colspan="100%" no-hover>
          <q-tabs v-model="props.row.selectedCourse" active-color="m5" class="q-mt-xs q-mb-md">
            <q-tab v-for="(, index) in props.row.subjects" :label="courseNames[index]" :name="index" />
          </q-tabs>

          <q-table
            :columns="subjectColumns"
            :rows="props.row.subjects[props.row.selectedCourse]"
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
                  {{
                    $q.screen.lt.lg && props.row.name.length > 35
                      ? reduceSubjectName(props.row.name)
                      : props.row.name
                  }}
                </q-td>

                <q-td key="semester" :props="props">
                  {{ props.row.semester }}
                </q-td>

                <q-td key="credits" :props="props">
                  {{ props.row.credits }}
                </q-td>

                <q-td key="areas" :props="props">
                  <span v-if="!props.row.areas || props.row.areas.length === 0" class="text-warning">
                    -
                  </span>

                  <div v-else v-auto-animate="{ duration: 700 }">
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

                  <div v-else v-auto-animate="{ duration: 700 }">
                    <div
                      v-for="{ name } in props.row.labTypes"
                      :class="[props.row.labTypes.length > 1 && 'q-my-sm']">
                      {{ name }}
                    </div>
                  </div>
                </q-td>

                <q-td key="bigGroups" :props="props">
                  {{ props.row.bigGroups }}
                </q-td>

                <q-td key="mediumGroups" :props="props">
                  {{ props.row.mediumGroups }}
                </q-td>

                <q-td key="smallGroups" :props="props">
                  {{ props.row.smallGroups }}
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
</style>
