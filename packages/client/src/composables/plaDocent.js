import { ref, isRef, unref, watchEffect } from 'vue';
import { read } from 'xlsx';
import _ from 'lodash';

import { useAcademicCoursesStore } from '@/stores';
import { studiesApi, academicCoursesApi } from '@/api';

const academicCoursesStore = useAcademicCoursesStore();

const NO_AREA = 'EN BLANC';

const columnsToPeek = {
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
  NGP: 'littleGroups',
  Labs: 'labType',
  nLabs: 'labTypeCapacity'
};

const subjectSharing = {
  Comp_ARQ: ['GARQ', 'GATE'],
  Compartides: ['GETI', 'GEB', 'GEM', 'GEE', 'GEEIA', 'GEQ'],
  ComAlim: ['GEA', 'GINSA'],
  ComInf: ['GEINF', 'GDDV']
};

const sharedSubjectsCoursePositionMapping = {
  GARQ: 0,
  GATE: 1,
  GEA: 0,
  GINSA: 1,
  GEINF: 0,
  GDDV: 1
};

const inferableFields = ['name', 'course', 'semester'];

const semesterNormalization = {
  A: 1,
  B: 2
};

const normalizeSemester = semester => {
  return semesterNormalization[semester] || semester;
};

const readFile = async file => {
  return read(await file.arrayBuffer(), {
    cellFormula: false,
    cellHTML: false,
    cellText: false
  });
};

const finishWithSuccess = uploading => {
  setTimeout(() => (uploading.value = false), 500);
};

const finishWithError = (uploading, error, errorMsg) => {
  uploading.value = false;
  error.value = errorMsg;
};

const isLetter = char => char.toLowerCase() != char.toUpperCase();

const isUpperCase = char => char === char.toUpperCase();

const getColId = cell => {
  return cell.split('').reduce((accum, char) => `${accum}${isLetter(char) ? char : ''}`, '');
};

const getRowId = cell => +_.difference(cell.split(''), getColId(cell).split('')).join('');

const makeColumns = sheets => {
  return Object.entries(sheets)
    .filter(([name]) => name.toUpperCase().startsWith('G') || name.toUpperCase().startsWith('C'))
    .reduce(
      (accum1, [name, cells]) => [
        ...accum1,
        {
          name,
          columns: Object.entries(cells).reduce((accum2, [key, { t, v }]) => {
            const colId = getColId(key);
            if (!colId || !isLetter(colId[0]) || !isUpperCase(colId[0])) {
              return accum2;
            }
            const rowId = getRowId(key);
            const cellValue = { t, v };
            const colIndex = accum2.findIndex(({ colId: id }) => id === colId);
            if (colIndex > -1) {
              accum2.at(colIndex).cells[rowId - 1] = cellValue;
              return accum2;
            }
            const cells = [];
            cells[rowId - 1] = cellValue;
            return [...accum2, { colId, cells }];
          }, [])
        }
      ],
      []
    )
    .map(({ name, columns }) => ({ name, columns: columns.map(({ cells }) => cells) }));
};

const formatData = sheets => {
  return sheets.map(({ name, columns }) => {
    const cleanedColumns = columns.reduce((accum, column) => {
      let i = 0;
      while (!columnsToPeek[column[i]?.v] && i < column.length) {
        i++;
      }
      if (i < column.length) {
        return [...accum, column.slice(i).map(({ t, v }) => ({ t, v: t === 's' ? v.trim() : v }))];
      }
      return accum;
    }, []);

    const nSubjects = cleanedColumns.find(column => columnsToPeek[column[0].v] === 'code').length;

    const subjects = [];
    for (let i = 1; i < nSubjects; i++) {
      subjects.push(
        cleanedColumns.reduce((accum, column) => {
          accum[columnsToPeek[column[0].v]] = column[i]?.v || null;
          return accum;
        }, {})
      );
    }

    const erasedNullCodedSubjects = subjects.reduce(
      (accum, subject) => (subject.code ? [...accum, subject] : accum),
      []
    );

    const inferedNullFieldedSubjects = erasedNullCodedSubjects.map(subject => {
      const sameCodedSubject = erasedNullCodedSubjects.find(({ code }) => code === subject.code);
      if (!sameCodedSubject) {
        return subject;
      }

      const inferedSubject = { ...subject };

      inferableFields.forEach(field => {
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
};

const addSubjects = (studies, subjects) => {
  studies.forEach(study => {
    study.subjects.push(
      ...subjects.map(subject => {
        let course = subject.course;
        if (typeof course === 'string' || course instanceof String) {
          const courses = course.split('/');
          course = +courses[courses.length < 1 ? 0 : sharedSubjectsCoursePositionMapping[study.name]];
        }
        return { ...subject, course };
      })
    );
  });
};

const processSharedSubjects = plaDocentData => {
  const toShare = plaDocentData.filter(({ name }) => Object.keys(subjectSharing).includes(name));
  const studies = _.difference(plaDocentData, toShare);

  toShare.forEach(({ name, subjects }) =>
    addSubjects(
      subjectSharing[name].map(studyName => studies.find(study => study.name === studyName)),
      subjects
    )
  );

  return studies;
};

const uploadStudy = (studyName, subjects) => {
  console.log('Uploading', studyName);
  console.log('Subjects', subjects);
  return studiesApi.create(
    {
      abv: studyName,
      subjects
    },
    academicCoursesStore.selected.startYear
  );
};

const uploadPlaDocent = async (plaDocentData, percentage) => {
  let i = 0;
  for (const { name, subjects } of plaDocentData) {
    await uploadStudy(name, subjects);
    percentage.value = (++i / plaDocentData.length) * 100;
  }

  if (academicCoursesStore.hasPast) {
    await academicCoursesApi.update(academicCoursesStore.current.startYear, { active: false });
  }
  const activeStartYear = academicCoursesStore.selected.startYear;
  await academicCoursesApi.update(activeStartYear, { active: true });
  await academicCoursesApi.create({ startYear: activeStartYear + 1 });
};

const processData = async (file, uploading, percentage, error) => {
  try {
    const { Sheets: sheets } = await readFile(file);
    console.log('Raw', sheets);
    const plaDocentData = processSharedSubjects(formatData(makeColumns(sheets)));
    console.log('Pla Docent data', plaDocentData);

    await uploadPlaDocent(plaDocentData, percentage);
    finishWithSuccess(uploading);
  } catch (e) {
    console.log('Error', e);
    return finishWithError(uploading, error, e.message);
  }
};

export const usePlaDocent = file => {
  const uploading = ref(false);
  const percentage = ref(0);
  const error = ref('');

  const doProcessData = () => {
    if (!file.value) {
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
