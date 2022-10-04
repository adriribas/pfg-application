import _ from 'lodash';
import createDebugger from 'debug';

import { User as Model } from '#r/models';

const debug = createDebugger('pfgs:userMiddleware');

const restrictedFields = ['secret'];

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

const permissions = {
  Administrador: ['Coordinador', 'Director de departament'],
  Coordinador: [],
  'Director de departament': ['Responsable de docencia'],
  'Responsable de docencia': ['Professor'],
  Professor: []
};

export const hasPermissions = (currentUserData, newUserData) => {
  return permissions[currentUserData.role]?.includes(newUserData.role);
};
