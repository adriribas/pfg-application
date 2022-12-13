import _ from 'lodash';
import createDebugger from 'debug';

import { LabType as Model } from '#r/models';
import { reqProcessing } from '#r/utils';

const { buildWhere, updateFields, isValidUpdateData, resError, isDuplicationError } = reqProcessing;
const debug = createDebugger('pfgs:labTypeController');

export const get = async (req, res) => {
  const {
    params: { name },
    query: { fields }
  } = req;
  if (!name) {
    return resError(
      res,
      400,
      'KEY_NOT_PROVIDED',
      "No s'ha proporcionat l'identificador del tipus de laboratori."
    );
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

export const create = async (req, res) => {
  const { body: data } = req;

  try {
    await Model.validate(data);
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  try {
    res.status(201).json(await Model.create(data));
  } catch (e) {
    if (isDuplicationError(e)) {
      return resError(res, 400, 'DUPLICATION', 'Ja existeix un tipus de laboratori amb aquest nom.');
    }
    throw e;
  }
};

export const update = async (req, res) => {
  const {
    params: { name },
    body: data
  } = req;
  if (!name) {
    return resError(
      res,
      400,
      'KEY_NOT_PROVIDED',
      "No s'ha proporcionat l'identificador del tipus de laboratori."
    );
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(
      res,
      400,
      'INVALID_DATA',
      'Les dades per actualitzar el tipus de laboratori no són vàlides.'
    );
  }

  const labType = await Model.findByPk(name);
  if (!labType) {
    return resError(res, 404);
  }

  const { ...attributes } = data;
  await updateFields(labType, attributes);

  res.json(await Model.findByPk(name));
};
