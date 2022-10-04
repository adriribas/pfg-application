import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { db as sequelize } from '#r/startup';

const { resError } = reqProcessing;
const debug = createDebugger('pfgs:reqProcessingMiddleware');

const splitBy = (values, splitter = ',') => {
  if (!values) {
    return null;
  }
  return values.split(splitter);
};

export const requestFormatter = (req, _res, next) => {
  const { query } = req;

  query.fields = splitBy(query.fields);
  query.include =
    splitBy(query.include)?.reduce((accum, modelName) => {
      try {
        const upperFstModelName = _.upperFirst(modelName);
        accum[upperFstModelName] = sequelize.model(upperFstModelName);
      } catch (e) {
        debug('Invalid include', e.message);
      }
      return accum;
    }, {}) || {};

  debug('Fields', query.fields);
  debug('Include', query.include);

  next();
};

const validateFieldsMatching = (fields, Model) => {
  if (!fields || fields.length === 0) {
    return true;
  }
  const attributes = Object.keys(Model.getAttributes());
  return fields.every(field => attributes.includes(field));
};

const validateIncludeMatching = (include, Model) => {
  if (!Object.keys(include).length) {
    return true;
  }
  if (!Model.allowedInclusions) {
    return false;
  }
  return Object.values(include).every(IncludedModel => Model.allowedInclusions.includes(IncludedModel));
};

export const requestValidator = Model => (req, res, next) => {
  const {
    query: { fields, include }
  } = req;

  if (!validateFieldsMatching(fields, Model)) {
    return resError(res, 400, 'BAD_QUERY_FIELDS', 'Some query fields are invalid.');
  }
  if (!validateIncludeMatching(include, Model)) {
    return resError(res, 400, 'BAD_QUERY_INCLUDE', 'Query include is invalid.');
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
