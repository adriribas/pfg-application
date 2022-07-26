import { Op, col } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { AcademicCourse as Model } from '#r/models';
import { reqValidationUtil } from '#r/utils';

const debug = createDebugger('pfgs:academicCourseController');

export const validateRequest = (req, res, next) => {
  if (reqValidationUtil.validateReq(req, Model, res)) {
    next();
  }
};

export const validateExistance = async (req, res, next) => {
  if (!(await Model.count({ where: { id: req.params.academicCourseId } }))) {
    return res.status(404).send();
  }

  next();
};

/** Handlers **/

export const get = async (req, res) => {
  const academicCourse = await Model.findByPk(req.params.id, { attributes: req.query.fields });

  if (!academicCourse) {
    return res.status(404).send();
  }

  res.json(academicCourse);
};

export const queryGet = async (req, res) => {
  res.json(await Model.findAll({ attributes: req.query.fields, order: col('startYear') }));
};

export const create = async (req, res) => {
  const lastAcademicCourse = (await Model.findAll({ order: col('startYear') })).at(-1);
  const startYear = lastAcademicCourse ? lastAcademicCourse.startYear + 1 : new Date().getFullYear();

  res.status(201).json(await Model.create({ startYear }));
};
