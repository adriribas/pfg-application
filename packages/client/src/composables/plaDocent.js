import { ref, isRef, unref, watchEffect } from 'vue';
import { read } from 'xlsx';
import _ from 'lodash';

import { useSchoolsStore } from '@/stores';
import { schoolsApi, studiesApi, labTypesApi } from '@/api';

const schoolsStore = useSchoolsStore();

const PLADOCENTSHEETSNAMES = [
  'GARQ',
  'GATE',
  'COMP_ARQ',
  'GETI',
  'GEB',
  'GEM',
  'GEE',
  'GEEIA',
  'GEQ',
  'COMPARTIDES',
  'GEA',
  'GINSA',
  'COMALIM',
  'GEINF',
  'GDDV',
  'COMINF'
];

const LABTYPESSHEETNAME = 'LABORATORIS';

const PLADOCENTCOLUMNS = {
  Codi: 'code',
  Codis: 'code',
  'C odi': 'code',
  Assignatura: 'name',
  Dept: 'department',
  Àrea: 'area',
  Curs: 'course',
  Sem: 'semester',
  'Cr.': 'credits',
  NGG: 'bigGroups',
  NGM: 'mediumGroups',
  NGP: 'smallGroups',
  Labs: 'labType'
};

const LABTYPESCOLUMNS = {
  nom: 'name',
  nombre: 'amount',
  capacitat: 'capacity'
};

const SUBJECTSHARING = {
  COMP_ARQ: ['GARQ', 'GATE'],
  COMPARTIDES: ['GETI', 'GEB', 'GEM', 'GEE', 'GEEIA', 'GEQ'],
  COMALIM: ['GEA', 'GINSA'],
  COMINF: ['GEINF', 'GDDV']
};

const SHAREDSUBJECTSCOURSEPOSITIONMAPPING = {
  GARQ: 0,
  GATE: 1,
  GEA: 0,
  GINSA: 1,
  GEINF: 0,
  GDDV: 1
};

const INFERABLEFIELDS = ['name', 'course', 'semester'];

const SEMESTERNORMALIZATION = {
  A: 1,
  B: 2
};

const LABTYPENAMETOERASECHARS = ['(', ')', '?', '¿', '.', '-', ' '];

const readFile = async file =>
  read(await file.arrayBuffer(), {
    cellFormula: false,
    cellHTML: false,
    cellText: false
  });

const getFileSheets = async file => {
  const { Sheets: sheets } = await readFile(file);
  console.log('Raw', sheets);
  return Object.entries(sheets).map(([name, cells]) => ({ name: name.toUpperCase(), cells }));
};

const getPlaDocentSheets = sheets =>
  sheets.filter(({ name }) => PLADOCENTSHEETSNAMES.includes(name.toUpperCase()));

const getLabTypesSheet = sheets => sheets.find(({ name }) => name === LABTYPESSHEETNAME);

const finishWithSuccess = uploading => setTimeout(() => (uploading.value = false), 500);

const finishWithError = (uploading, error, errorMsg) => {
  uploading.value = false;
  error.value = errorMsg;
};

const isLetter = char => char.toLowerCase() != char.toUpperCase();

const isUpperCase = char => char === char.toUpperCase();

const getColId = cell => cell.split('').reduce((accum, char) => `${accum}${isLetter(char) ? char : ''}`, '');

const getRowId = cell => +_.difference(cell.split(''), getColId(cell).split('')).join('');

const makeColumns = ({ name, cells }) => ({
  name,
  columns: Object.entries(cells)
    .reduce((accum, [key, { t, v }]) => {
      const colId = getColId(key);
      if (!colId || !isLetter(colId[0]) || !isUpperCase(colId[0])) {
        return accum;
      }
      const rowId = getRowId(key);
      const cellValue = { t, v };
      const colIndex = accum.findIndex(({ colId: id }) => id === colId);
      if (colIndex > -1) {
        accum.at(colIndex).cells[rowId - 1] = cellValue;
        return accum;
      }
      const cells = [];
      cells[rowId - 1] = cellValue;
      return [...accum, { colId, cells }];
    }, [])
    .map(({ cells }) => cells)
});

const normalizeSemester = semester => {
  return SEMESTERNORMALIZATION[semester] || semester;
};

const cleanColumns = (columns, columnsToPeek) =>
  columns.reduce((accum, column) => {
    let i = 0;
    while (!columnsToPeek[column[i]?.v] && i < column.length) {
      i++;
    }
    if (i < column.length) {
      return [...accum, column.slice(i).map(({ t, v }) => ({ t, v: t === 's' ? v.trim() : v }))];
    }
    return accum;
  }, []);

const formObjects = (columns, fields, keyField) => {
  const cleanedColumns = cleanColumns(columns, fields);
  const keyColumn = cleanedColumns.find(([{ v }]) => fields[v] === keyField);
  const objects = [];

  for (let i = 1; i < keyColumn.length; i++) {
    if (keyColumn[i]?.v) {
      objects.push(
        cleanedColumns.reduce(
          (accum, column) => ({
            ...accum,
            [fields[column[0].v]]: column[i]?.v || null
          }),
          {}
        )
      );
    }
  }

  return objects;
};

const formatPlaDocentData = sheets =>
  sheets.map(({ name, columns }) => {
    const subjects = formObjects(columns, PLADOCENTCOLUMNS, 'code');

    const inferedNullFieldedSubjects = subjects.map(subject => {
      const sameCodedSubject = subjects.find(({ code }) => code === subject.code);
      if (!sameCodedSubject) {
        return subject;
      }

      const inferedSubject = { ...subject };

      INFERABLEFIELDS.forEach(field => {
        if (!subject[field]) {
          inferedSubject[field] = sameCodedSubject[field];
        }
      });

      return inferedSubject;
    });

    return {
      name,
      subjects: inferedNullFieldedSubjects.map(subject => ({
        ...subject,
        name: subject.name.split('(').at(0).trim(),
        semester: normalizeSemester(subject.semester)
      }))
    };
  });

const formatLabTypesData = ({ columns }) => {
  const labTypes = formObjects(columns, LABTYPESCOLUMNS, 'name');

  return labTypes.map(({ name, ...labType }) => ({ name: cleanLabTypeName(name), ...labType }));
};

const addSubjects = (studies, subjects) =>
  studies.forEach(study => {
    study.subjects.push(
      ...subjects.map(subject => {
        let course = subject.course;
        if (typeof course === 'string' || course instanceof String) {
          const courses = course.split('/');
          course = +courses[courses.length < 1 ? 0 : SHAREDSUBJECTSCOURSEPOSITIONMAPPING[study.name]];
        }
        return { ...subject, course };
      })
    );
  });

const processSharedSubjects = plaDocentData => {
  const toShare = plaDocentData.filter(({ name }) => Object.keys(SUBJECTSHARING).includes(name));
  const studies = _.difference(plaDocentData, toShare);

  toShare.forEach(({ name, subjects }) =>
    addSubjects(
      SUBJECTSHARING[name].map(studyName => studies.find(study => study.name === studyName)),
      subjects
    )
  );

  return studies;
};

const cleanLabTypeName = name =>
  name
    .split('')
    .reduce((accum, char) => `${accum}${LABTYPENAMETOERASECHARS.includes(char) ? '' : char}`, '')
    .toUpperCase();

const getLabTypes = labTypes => labTypes.split('/').map(cleanLabTypeName);

const mergeSubjects = plaDocentData =>
  plaDocentData.map(study => ({
    ...study,
    subjects: study.subjects.reduce((accum, subject) => {
      const areas = subject.area ? [{ abv: subject.area, department: { abv: subject.department } }] : [];
      const labTypes = subject.labType ? getLabTypes(subject.labType) : [];
      const existingSubject = accum.find(({ code }) => code === subject.code);

      if (!existingSubject) {
        delete subject.area;
        delete subject.department;
        delete subject.labType;
        return [...accum, { ...subject, areas, labTypes }];
      }

      existingSubject.areas.push(...areas);
      existingSubject.labTypes.push(...labTypes);

      return accum;
    }, [])
  }));

const uploadLabTypes = async labTypesData => {
  const { data: labTypes } = await labTypesApi.list({ params: { fields: 'name,amount,capacity' } });

  return Promise.all(
    labTypesData.map(async labTypeData => {
      const labType = labTypes.find(({ name }) => name === labTypeData.name);
      if (!labType) {
        return labTypesApi.create(labTypeData);
      }
      if (!_.isEqual(labTypeData, labType)) {
        return labTypesApi.update(labTypeData.name, _.pick(labTypeData, ['amount', 'capacity']));
      }
      return Promise.resolve(labType);
    })
  );
};

const uploadPlaDocent = async (plaDocentData, percentage) => {
  let i = 0;
  for (const { name, subjects } of plaDocentData) {
    console.log('Uploading', name, subjects);
    await studiesApi.create({ abv: name, subjects });
    percentage.value = (++i / plaDocentData.length) * 100;
  }
  await schoolsApi.update(schoolsStore.school.abv, { currentStartYear: schoolsStore.nextStartYear });
};

const processData = async (file, uploading, percentage, error) => {
  try {
    const sheets = await getFileSheets(file);
    const plaDocentSheets = getPlaDocentSheets(sheets);
    const labTypesSheet = getLabTypesSheet(sheets);

    const plaDocentData = mergeSubjects(
      processSharedSubjects(formatPlaDocentData(plaDocentSheets.map(makeColumns)))
    );
    console.log('Pla Docent data', plaDocentData);

    const labTypesData = formatLabTypesData(makeColumns(labTypesSheet));
    console.log('Lab types data', labTypesData);

    await uploadLabTypes(labTypesData);
    await uploadPlaDocent(plaDocentData, percentage);
    finishWithSuccess(uploading);
  } catch (e) {
    console.error('Error', e);
    return finishWithError(uploading, error, e.message);
  }
};

export default file => {
  const uploading = ref(false);
  const percentage = ref(0);
  const error = ref('');

  const doProcessData = () => {
    if (!file || (isRef(file) && !file.value)) {
      return;
    }

    uploading.value = true;
    percentage.value = 0;
    error.value = '';
    processData(unref(file), uploading, percentage, error);
  };

  if (isRef(file)) {
    watchEffect(doProcessData);
  } else {
    doProcessData();
  }

  return { uploading, percentage, error };
};
