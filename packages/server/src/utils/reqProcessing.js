import { Op } from 'sequelize';

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

/* Error utilities */

export const resError = (res, status, code, message = '') => {
  res.status(status).json({ code: code ? `ERR_${code}` : '', message });
};

export const isDuplicationError = ({ errors, parent, original }) =>
  errors.some(({ type }) => type === 'unique violation') ||
  parent.code === 'ER_DUP_ENTRY' ||
  original.code === 'ER_DUP_ENTRY';
