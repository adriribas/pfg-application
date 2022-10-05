import _ from 'lodash';
import createDebugger from 'debug';

import { User as Model } from '#r/models';

const debug = createDebugger('pfgs:userMiddleware');

const restrictedFields = Model.restrictedFields;

const getAllowedFields = () => _.difference(Object.keys(Model.getAttributes()), restrictedFields);

export const applyFieldRestrictions = (req, _res, next) => {
  const { query } = req;

  if (!query.fields) {
    query.fields = getAllowedFields();
  } else if (query.fields.length) {
    _.remove(query.fields, field => restrictedFields.includes(field));
  }

  next();
};
