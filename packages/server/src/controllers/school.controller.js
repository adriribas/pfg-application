import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { School as Model } from '#r/models';

const { buildWhere, resError } = reqProcessing;
const debug = createDebugger('pfgs:schoolController');

export const get = async (req, res) => {
  const {
    params: { abv },
    query: { fields }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'School key not provided.');
  }

  const school = await Model.findByPk(abv, { attributes: fields });
  if (!school) {
    return resError(res, 404);
  }

  res.json(school);
};

export const filter = async (req, res) => {
  const {
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(await Model.findAll({ where: buildWhere(filterData), attributes: fields }));
};

export const update = async (req, res) => {
  const {
    params: { abv },
    body: data
  } = req;
  if (!abv) {
    return resError(res, 404);
  }

  const school = await Model.findByPk(abv);
  if (!school) {
    return resError(res, 404);
  }

  await school.update(_.pick(data, Model.updatableFields));

  res.json(school);
};
