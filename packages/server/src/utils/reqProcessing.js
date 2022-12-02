import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

const debug = createDebugger('pfgs:reqProcessingUtil');

/* Sequelize utilities */

export const buildWhere = (filterData = {}) => ({
  [Op.and]: Object.entries(filterData).map(([field, value]) => ({
    [field]: { [Op.or]: Array.isArray(value) ? value : [value] }
  }))
});

export const findOrCreate = async (Model, primaryKey, data, transaction) => {
  await Model.validate(data);
  return Model.findOrCreate({
    where: primaryKey,
    defaults: data,
    transaction
  });
};

export const createOrUpdate = async (Model, primaryKey, data, transaction) => {
  const [instance, created] = await findOrCreate(Model, primaryKey, data, transaction);

  if (!created) {
    await instance.update(data, { transaction });
  }

  return [instance, created];
};

export const updateFields = async (entity, data) => {
  if (_.isEmpty(data)) {
    return;
  }
  Object.entries(data).forEach(([field, value]) => (entity[field] = value));
  await entity.save();
};

export const updateRelation = async (RelationModel, relationKeys, entity, methodName) => {
  if (!relationKeys) {
    return;
  }

  const relationEntities = [];
  for (const relationKey of relationKeys) {
    try {
      const relationEntity = await RelationModel.findByPk(relationKey);
      if (relationEntity) {
        relationEntities.push(relationEntity);
      }
    } catch (e) {
      debug('Error getting entities', { RelationModel, relationKeys });
    }
  }
  await entity[methodName](relationEntities);

  return relationEntities;
};

/* Validation utilities */

export const isValidUpdateData = (Model, data = {}) => {
  const updatableFields = Model.updatableFields;

  if (!updatableFields || !updatableFields.length || _.isEmpty(data)) {
    return false;
  }

  return Object.keys(data).every(key => updatableFields.includes(key));
};

/* Error utilities */

export const resError = (res, status, code, message = '') =>
  res.status(status).json({ code: code ? `ERR_${code}` : '', message });

export const isDuplicationError = ({ errors, parent, original }) =>
  errors.some(({ type }) => type === 'unique violation') ||
  parent.code === 'ER_DUP_ENTRY' ||
  original.code === 'ER_DUP_ENTRY';

export const isForeignKeyError = ({ name }) => name === 'SequelizeForeignKeyConstraintError';
