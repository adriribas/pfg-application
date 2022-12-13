import _ from 'lodash';
import config from 'config';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { TimeBlock as Model, Group as GroupModel } from '#r/models';

const { buildWhere, isValidUpdateData, updateFields, resError, isForeignKeyError } = reqProcessing;
const debug = createDebugger('pfgs:timeBlockController');

export const get = async (req, res) => {
  const {
    params: { id },
    query: { fields }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del bloc horari.");
  }

  const timeBlock = await Model.findByPk(id, { attributes: fields });
  if (!timeBlock) {
    return resError(res, 404);
  }

  res.json(timeBlock);
};

export const filter = async (req, res) => {
  const {
    query: fields,
    body: { data: filterData }
  } = req;

  res.json(await Model.findAll({ where: buildWhere(filterData), attributes: fields }));
};

export const create = async (req, res) => {
  const {
    body: { group: groupId }
  } = req;

  if (!groupId) {
    return resError(res, 400, 'INVALID_DATA', "No s'ha proporcionat l'identificador del grup.");
  }

  try {
    await Model.validate({ group: groupId });
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  const group = await GroupModel.findByPk(groupId);
  if (!group) {
    return resError(res, 400, 'INVALID_RELATION_KEYS', 'Algun dels identificadors de relacions no és vàlid.');
  }

  res.status(201).json(await group.createTimeBlock({ ...config.get(`defaultData.timeBlock.${group.type}`) }));
};

export const update = async (req, res) => {
  const {
    params: { id },
    body: data
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del bloc horari.");
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'Les dades per actualitzar el bloc horari no són vàlides.');
  }

  const timeBlock = await Model.findByPk(id);
  if (!timeBlock) {
    return resError(res, 404);
  }

  const { ...attributes } = data;
  await updateFields(timeBlock, attributes);

  res.json(timeBlock);
};

export const remove = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del bloc horari.");
  }

  const timeBlock = await Model.findByPk(id);
  if (!timeBlock) {
    return resError(res, 404);
  }

  await timeBlock.destroy();

  res.status(204).json();
};
