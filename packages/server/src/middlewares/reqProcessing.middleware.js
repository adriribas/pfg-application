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

  next();
};

const validateFieldsMatching = (fields, Model) => {
  if (!fields?.length) {
    return true;
  }
  const attributes = Object.keys(Model.getAttributes());
  return fields.every(field => attributes.includes(field));
};

const validateFieldsRestriction = (fields, Model) => {
  const restrictedFields = Model.restrictedFilterFields;

  if (!fields?.length || !restrictedFields?.length) {
    return true;
  }

  return !fields.some(field => restrictedFields.includes(field));
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
    return resError(res, 400, 'BAD_QUERY_FIELDS', 'La consulta conté atributs invàlids.');
  }
  if (!validateFieldsRestriction(fields, Model)) {
    return resError(res, 400, 'BAD_QUERY_FIELDS', 'La consulta conté atributs restringits.');
  }
  if (!validateIncludeMatching(include, Model)) {
    return resError(res, 400, 'BAD_QUERY_INCLUDE', 'La consulta conté "includes" invàlids.');
  }

  next();
};

const checkRequired = (filterData, requiredFields) => {
  return requiredFields.every(field => filterData[field]);
};

export const validateFilterData = (filterData, Model) => {
  const filterDataKeys = Object.keys(filterData);

  return validateFieldsMatching(filterData, Model) && validateFieldsRestriction(filterDataKeys, Model);
};

export const filterValidator = Model => (req, res, next) => {
  const data = req.body.data || {};
  const associations = req.body.associations || {};

  if (!checkRequired({ ...data, ...associations }, Model.requiredFilterFields || [])) {
    return resError(res, 400, 'REQUIRED', "No s'han proporcionat tots els camps de filtratge obligatòris.");
  }

  if (!validateFilterData(data, Model)) {
    return resError(res, 400, 'BAD_FIELDS', 'Alguns camps de filtratge són invàlids o bé estan restringits.');
  }

  next();
};

const generateFilterScope = (Model, methodName, value) => Model.scope({ method: [methodName, value] });

export const generateScopes = (req, _res, next) => {
  const {
    user: { school: schoolAbv, study, department }
  } = req;

  req.scopes = {
    school: Model => generateFilterScope(Model, 'school', schoolAbv),
    study: study ? Model => generateFilterScope(Model, 'study', study.abv) : Model => Model,
    department: department
      ? Model => generateFilterScope(Model, 'department', department.abv)
      : Model => Model
  };

  next();
};
