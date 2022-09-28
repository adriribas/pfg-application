import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { Department as Model } from '#r/models';

const { buildWhere, resError } = reqProcessing;
const debug = createDebugger('pfgs:departmentController');

export const get = async (req, res) => {
  const {
    params: { abv },
    query: { fields }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Department key not provided.');
  }

  const department = await Model.findByPk(abv, { attributes: fields });
  if (!department) {
    return resError(res, 404);
  }

  res.json(department);
};

export const filter = async (req, res) => {
  const {
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      attributes: fields
    })
  );
};
