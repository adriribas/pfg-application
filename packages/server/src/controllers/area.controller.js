import _ from 'lodash';
import createDebugger from 'debug';

import { Area as Model } from '../models';
import { reqValidationUtil } from '../utils';

const debug = createDebugger('pfgs:departmentController');

export const validateRequest = (req, res, next) => {
  if (reqValidationUtil.validateReq(req, Model, res)) {
    next();
  }
};

/** Handlers **/

export const get = async (req, res) => {
  const { departmentId, id } = req.params;
  const area = await Model.findOne({
    where: { DepartmentId: departmentId, id },
    attributes: req.query.fields
  });

  if (!area) {
    res.status(404).send();
  }

  res.json(area);
};

export const queryGet = async (req, res) => {
  res.json(await Model.findAll({ attributes: req.query.fields }));
};

export const create = async (req, res) => {
  const { academicCourseId: AcademicCourseId, departmentId: DepartmentId } = req.params;
  const data = { ..._.pick(req.body, ['abv', 'name']), AcademicCourseId, DepartmentId };
  debug('Creation data', data);
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
