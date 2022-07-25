import _ from 'lodash';
import createDebugger from 'debug';

import { Department as Model } from '../models';
import { reqValidationUtil } from '../utils';

const debug = createDebugger('pfgs:departmentController');

export const validateRequest = (req, res, next) => {
  if (reqValidationUtil.validateReq(req, Model, res)) {
    next();
  }
};

export const validateExistance = async (req, res, next) => {
  if (!(await Model.count({ where: { AcademicCourseId: req.params.academicCourseId, id: req.params.departmentId } }))) {
    return res.status(404).send();
  }

  next();
};

/** Handlers **/

export const get = async (req, res) => {
  const { academicCourseId, id } = req.params;
  const department = await Model.findOne({
    where: { AcademicCourseId: academicCourseId, id },
    attributes: req.query.fields
  });

  if (!department) {
    res.status(404).send();
  }

  res.json(department);
};

export const queryGet = async (req, res) => {
  res.json(await Model.findAll({ attributes: req.query.fields }));
};

export const create = async (req, res) => {
  const { academicCourseId: AcademicCourseId } = req.params;
  const data = { ..._.pick(req.body, ['abv', 'name']), AcademicCourseId };

  try {
    await Model.validate(data);
  } catch (e) {
    return res.status(400).json({ code: 'ERR_INVALID_DATA', desc: e.message });
  }

  try {
    res.status(201).json(await Model.create(data));
  } catch (e) {
    if (reqValidationUtil.isDuplicationError(e)) {
      return res.status(400).json({ code: 'ERR_DUPLICATED_ENTRY' });
    }
    throw e;
  }
};
