import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { Department as Model, School as SchoolModel } from '#r/models';

const { buildWhere, resError } = reqProcessing;
const debug = createDebugger('pfgs:departmentController');

const buildInclude = ({ schoolAbv }) => {
  const include = [
    {
      model: SchoolModel,
      where: buildWhere({ abv: schoolAbv }),
      through: { attributes: [] },
      attributes: []
    }
  ];

  return include;
};

export const get = async (req, res) => {
  const {
    user: { school: schoolAbv },
    params: { abv },
    query: { fields }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Department key not provided.');
  }

  const department = await Model.findByPk(abv, { include: buildInclude({ schoolAbv }), attributes: fields });
  if (!department) {
    return resError(res, 404);
  }

  res.json(department);
};

export const filter = async (req, res) => {
  const {
    user: { school: schoolAbv },
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      include: buildInclude({ schoolAbv }),
      attributes: fields
    })
  );
};
