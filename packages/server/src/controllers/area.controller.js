import _ from 'lodash';
import createDebugger from 'debug';

import { Area as Model } from '#r/models';
import { reqProcessing } from '#r/utils';

const { buildWhere, resError } = reqProcessing;
const debug = createDebugger('pfgs:areaController');

export const get = async (req, res) => {
  const { abv } = req.params;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Area key not provided.');
  }

  const area = await Model.findByPk(abv, { attributes: req.query.fields });
  if (!area) {
    return resError(res, 404);
  }

  res.json(area);
};

export const filter = async (req, res) => {
  const { data: filterData } = req.body;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      attributes: req.query.fields
    })
  );
};
