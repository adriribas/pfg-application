import _ from 'lodash';

import { reqProcessing } from '#r/utils';

const { resError } = reqProcessing;

export const requestFormatter = (req, _res, next) => {
  const query = req.query;

  if (query.fields) {
    query.fields = query.fields.split(',');
  }

  next();
};

const validateFieldsMatching = (fields, Model) => {
  if (!fields) {
    return true;
  }
  if (!fields instanceof Array) {
    return false;
  }
  const attributes = Object.keys(Model.getAttributes());
  return fields.every(field => attributes.includes(field));
};

export const requestValidator = Model => (req, res, next) => {
  const query = req.query;

  if (!validateFieldsMatching(query.fields, Model)) {
    res?.status(400).json({ code: 'ERR_BAD_QUERY_FIELDS' });
    return;
  }

  next();
};

export const checkRequired = (filterData, requiredFields) => {
  return requiredFields.every(field => filterData[field]);
};

export const validateFilterData = (filterData, Model) => {
  return validateFieldsMatching(Object.keys(filterData), Model);
};

export const filterValidator = Model => (req, res, next) => {
  const data = req.body.data || {};
  const associations = req.body.associations || {};

  if (!checkRequired({ ...data, ...associations }, Model.requiredFilterFields || [])) {
    return resError(res, 400, 'REQUIRED', 'Some required fields are not provided.');
  }

  if (!validateFilterData(data, Model)) {
    return resError(res, 400, 'BAD_FIELDS', 'Some fields do not match data model.');
  }

  next();
};
