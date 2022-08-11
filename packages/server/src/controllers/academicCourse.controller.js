import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { AcademicCourse as Model } from '#r/models';
import { reqProcessing } from '#r/utils';

const { buildWhere, resError, isDuplicationError } = reqProcessing;
const debug = createDebugger('pfgs:academicCourseController');

export const get = async (req, res) => {
  const { startYear } = req.params;
  if (!startYear) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Academic course key not provided.');
  }

  const academicCourse = await Model.findByPk(startYear, { attributes: req.query.fields });
  if (!academicCourse) {
    return resError(res, 404);
  }

  res.json(academicCourse);
};

export const filter = async (req, res) => {
  const { data: filterData } = req.body;
  const academicCourses = await Model.findAll({
    where: buildWhere(filterData),
    attributes: req.query.fields,
    order: [['startYear']]
  });

  res.json(
    req.user.role !== 'Administrador' && !academicCourses.at(-1).active
      ? academicCourses.slice(0, -1)
      : academicCourses
  );
};

export const create = async (req, res) => {
  const data = _.pick(req.body, ['startYear']);
  try {
    await Model.validate(data);
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  try {
    res.status(201).json(await Model.create(data));
  } catch (e) {
    if (isDuplicationError(e)) {
      return resError(res, 400, 'DUPLICATION', 'This academic course does already exist.');
    }
    throw e;
  }
};

export const update = async (req, res) => {
  const startYear = req.params.startYear;
  if (!startYear) {
    return resError(res, 404);
  }

  const academicCourse = await Model.findByPk(startYear);
  if (!academicCourse) {
    return resError(res, 404);
  }

  Object.entries(_.pick(req.body, ['active'])).forEach(([field, value]) => (academicCourse[field] = value));
  await academicCourse.save();

  res.json(academicCourse);
};
