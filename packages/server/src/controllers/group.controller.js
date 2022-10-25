import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing, groupsUtil } from '#r/utils';
import { Group as Model } from '#r/models';

const { buildWhere, isValidUpdateData, updateFields, updateRelation, resError } = reqProcessing;
const { syncSubjectGroups } = groupsUtil;
const debug = createDebugger('pfgs:groupController');

export const get = async (req, res) => {
  const {
    params: { id },
    query: { fields }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del grup.");
  }

  const group = await Model.findByPk(id, { attributes: fields });
  if (!group) {
    return resError(res, 404);
  }

  res.json(group);
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

export const create = async (req, res) => {};

export const update = async (req, res) => {
  const {
    params: { id },
    body: data
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del grup.");
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'Les dades per actualitzar el grup no són vàlides.');
  }

  const group = await Model.findByPk(id);
  if (!group) {
    return resError(res, 404);
  }

  res.json(group);
};

export const remove = async (req, res) => {};
