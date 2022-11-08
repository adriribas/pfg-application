import { studiesApi, subjectsApi } from '@/api';

const loadStudyData = async (studyAbv, course, semester) => {
  const { data: subjects } = await subjectsApi.list({
    params: {
      fields: 'code,name,credits,bigGroups,mediumGroups,smallGroups',
      include: 'Area,LabType,Group'
    },
    filterData: { semester },
    associations: { study: studyAbv },
    specialOptions: { course }
  });

  const { data: studies } = await studiesApi.list({
    params: {
      fields: 'abv,name'
    },
    associations: { subject: subjects.map(({ code }) => code) }
  });

  studies
    .filter(({ abv }) => abv !== studyAbv)
    .forEach(({ Subjects: studySubjects, ...study }) =>
      studySubjects.forEach(({ code: sharedSubjectCode, StudySubject: { course: sharedSubjectCourse } }) => {
        const subject = subjects.find(({ code }) => code === sharedSubjectCode);
        if (!subject) {
          return;
        }

        subject.sharedBy ??= [];
        if (!subject.sharedBy.find(({ abv }) => abv === study.abv)) {
          subject.sharedBy.push({ ...study, course: sharedSubjectCourse });
        }
      })
    );

  return {
    study: studies.find(({ abv }) => abv === studyAbv),
    subjects: subjects.map(({ Areas: areas, Groups: groups, LabTypes: labTypes, Studies, ...subject }) => ({
      ...subject,
      areas: areas.map(({ Department: department, ...area }) => ({ ...area, department })),
      groups: groups.map(({ TimeBlocks: timeBlocks, ...group }) => ({
        ...group,
        timeBlocks: timeBlocks.map(({ ...timeBlock }) => ({ ...timeBlock /*TODO*/ }))
      })),
      labTypes: labTypes
    }))
  };
};

const classifyTimeBlocks = subjects => {
  const placed = [[], [], [], [], []];
  console.log(placed);
  const unplaced = [];

  subjects.forEach(subject =>
    subject.groups.forEach(group =>
      group.timeBlocks.forEach(({ day, ...timeBlock }) => {
        if (day === null || day < 0 || day > 4) {
          return unplaced.push({ ...timeBlock, day, group, subject });
        }
        placed[day].push({ ...timeBlock, group, subject });
      })
    )
  );

  return { placed, unplaced };
};

export default () => ({ loadStudyData, classifyTimeBlocks });
