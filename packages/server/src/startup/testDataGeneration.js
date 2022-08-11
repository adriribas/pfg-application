import config from 'config';
import createDebugger from 'debug';
import _ from 'lodash';

import { User as UserModel } from '#r/models';
import { AcademicCourse as AcademicCourseModel } from '#r/models';

const debug = createDebugger('pfgs:testDataGeneration');

const createUsers = async () => {
  debug('Generating administrator users');
  await UserModel.bulkCreate(config.get('administratorUsers'));
  debug('Administrator users have been generated successfully');
};

const createAcademicCourses = async () => {
  debug('Generating academic courses');
  await AcademicCourseModel.create({ startYear: 2022 });
  debug('Academic courses have been generated successfully');
};

export default async () => {
  try {
    await Promise.all([createUsers(), createAcademicCourses()]);
  } catch (e) {
    debug('Error generating test data:', e.message);
  }
};
