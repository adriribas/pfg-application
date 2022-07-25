import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { Study as Model } from '../models';
import { reqValidationUtil } from '../utils';

const debug = createDebugger('pfgs:studyController');

export const validateRequest = (req, res, next) => {
  if (reqValidationUtil.validateReq(req, Model, res)) {
    next();
  }
};

/** Handlers **/

export const get = async (req, res) => {
  const { academicCourseId, id } = req.params;
  const study = await Model.findOne({
    where: { AcademicCourseId: academicCourseId, id },
    attributes: req.query.fields
  });

  if (!study) {
    res.status(404).send();
  }

  res.json(study);
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
