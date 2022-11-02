import { useAuthStore } from '@/stores';
import { studiesApi, subjectsApi } from '@/api';

const authStore = useAuthStore();

const getCourses = (studyAbv, subjects) =>
  subjects
    .reduce((accum, { Studies }) => {
      const study = Studies.find(({ abv }) => abv === studyAbv);
      if (!study) {
        return accum;
      }

      const {
        StudySubject: { course }
      } = study;
      return accum.includes(course) ? accum : [...accum, course];
    }, [])
    .sort((course1, course2) => course1 - course2);

const loadCoordinadorStudies = async () => {
  const { data: studies } = await studiesApi.list({ params: { fields: 'abv,name' } });

  const { data: subjects } = await subjectsApi.list({
    params: { fields: 'code' },
    associations: {
      study: studies.map(({ abv }) => abv)
    }
  });

  return {
    mainStudyData: {
      ...authStore.study,
      courses: getCourses(authStore.study.abv, subjects)
    },
    otherStudiesData: {
      title: 'Estudis amb els que comparteix assignatures',
      data: subjects.reduce((accum, { Studies }) => {
        if (Studies.length < 2 || !Studies.some(({ abv }) => abv === authStore.study.abv)) {
          return accum;
        }

        return [
          ...accum,
          ...Studies.reduce((accum2, { abv }) => {
            if (abv === authStore.study.abv || accum.some(study => study.abv === abv)) {
              return accum2;
            }

            return [
              ...accum2,
              { abv, name: studies.find(study => study.abv === abv).name, courses: getCourses(abv, subjects) }
            ];
          }, [])
        ];
      }, [])
    }
  };
};

const loadDirectorStudies = async () => ({
  otherStudiesData: { title: 'Estudis de les àrees del teu departament', data: [] }
});

const loadProfessorStudies = async () => ({
  otherStudiesData: { title: 'Estudis als que imparteixes docència', data: [] }
});

const loaders = {
  coordinador: loadCoordinadorStudies
};

export default role => loaders[role];
