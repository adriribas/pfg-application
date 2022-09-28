import _ from 'lodash';
import createDebugger from 'debug';

import { LabType as Model } from '#r/models';
import { reqProcessing } from '#r/utils';

const { buildWhere, updateFields, updateRelation, isValidUpdateData, resError } = reqProcessing;
const debug = createDebugger('pfgs:labTypeController');

export const get = async (req, res) => {
  const {
    params: { name },
    query: { fields }
  } = req;
  if (!name) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'LabType key not provided.');
  }

  const labType = await Model.findByPk(name, { attributes: fields });
  if (!labType) {
    return resError(res, 404);
  }

  res.json(labType);
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

export const update = async (req, res) => {
  const {
    params: { name },
    body: data
  } = req;
  if (!name) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'LabType key not provided.');
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'The data to update is not valid.');
  }

  const labType = await Model.findByPk(name);
  if (!labType) {
    return resError(res, 404);
  }

  const { ...attributes } = data;
  await updateFields(labType, attributes);

  res.json(await Model.findByPk(name));
};
