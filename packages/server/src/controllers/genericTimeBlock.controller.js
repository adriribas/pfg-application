import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { GenericTimeBlock as Model, Study as StudyModel } from '#r/models';

const { buildWhere, isValidUpdateData, updateFields, resError, isForeignKeyError } = reqProcessing;
const debug = createDebugger('pfgs:genericTimeBlockController');

const studyScope = ({ study: { abv: studyAbv } }) => Model.scope({ method: ['study', studyAbv] });

export const get = async (req, res) => {
  const {
    params: { id },
    query: { fields }
  } = req;
  if (!id) {
    return resError(
      res,
      400,
      'KEY_NOT_PROVIDED',
      "No s'ha proporcionat l'identificador del bloc horari genèric."
    );
  }

  const genTimeBlock = await Model.findByPk(id, { attributes: fields });
  if (!genTimeBlock) {
    return resError(res, 404);
  }

  res.json(genTimeBlock);
};

export const filter = async (req, res) => {
  const {
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(await Model.findAll({ where: buildWhere(filterData), attributes: fields }));
};

export const create = async (req, res) => {
  const { user: currentUserData, body: data } = req;

  if (!data.study) {
    return resError(res, 400, 'INVALID_DATA', "No s'ha proporcionat un identificador d'estudi.");
  }

  if (data.study !== currentUserData.study.abv) {
    return resError(
      res,
      403,
      'NO_PREMISSIONS',
      'No disposes dels permisos suficients per crear aquest bloc horari genèric.'
    );
  }

  try {
    await Model.validate(data);
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  try {
    const genTimeBlock = await Model.create(data);
    res
      .status(201)
      .json(_.pick(genTimeBlock, ['id', 'label', 'subLabel', 'day', 'start', 'duration', 'week']));
  } catch (e) {
    if (isForeignKeyError(e)) {
      return resError(
        res,
        400,
        'INVALID_RELATION_KEYS',
        'Algun dels identificadors de relacions no és vàlid'
      );
    }
    throw e;
  }
};

export const update = async (req, res) => {
  const {
    params: { id },
    body: data
  } = req;
  if (!id) {
    return resError(
      res,
      400,
      'KEY_NOT_PROVIDED',
      "No s'ha proporcionat l'identificador del bloc horari genèric."
    );
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(
      res,
      400,
      'INVALID_DATA',
      'Les dades per actualitzar el bloc horari genèric no són vàlides.'
    );
  }

  const genTimeBlock = await Model.findByPk(id);
  if (!genTimeBlock) {
    return resError(res, 404);
  }

  const { ...attributes } = data;
  await updateFields(genTimeBlock, attributes);

  res.json(genTimeBlock);
};

export const remove = async (req, res) => {
  const {
    user: currentUserData,
    params: { id }
  } = req;
  if (!id) {
    return resError(
      res,
      400,
      'KEY_NOT_PROVIDED',
      "No s'ha proporcionat l'identificador del bloc horari genèric."
    );
  }

  const genTimeBlock = await studyScope(currentUserData).findByPk(id);
  if (!genTimeBlock) {
    return resError(res, 404);
  }

  await genTimeBlock.destroy();

  res.status(204).json();
};
