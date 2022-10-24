import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing, usersUtil } from '#r/utils';
import { Department as Model, User as UserModel } from '#r/models';

const { buildWhere, isValidUpdateData, updateFields, resError } = reqProcessing;
const { hasPermissions } = usersUtil;
const debug = createDebugger('pfgs:departmentController');

export const get = async (req, res) => {
  const {
    scopes: { school: schoolScope },
    params: { abv },
    query: { fields }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del departament.");
  }

  const department = await schoolScope(Model).findByPk(abv, { attributes: fields });
  if (!department) {
    return resError(res, 404);
  }

  res.json(department);
};

export const filter = async (req, res) => {
  const {
    scopes: { school: schoolScope },
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(await schoolScope(Model).findAll({ where: buildWhere(filterData), attributes: fields }));
};

export const update = async (req, res) => {
  const {
    user: currentUserData,
    scopes: { school: schoolScope },
    params: { abv },
    body: data
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador del departament.");
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'Les dades per actualitzar el departament no són vàlides.');
  }

  const department = await schoolScope(Model).findByPk(abv);
  if (!department) {
    return resError(res, 404);
  }

  const { director: userId, ...attributes } = data;
  await updateFields(department, attributes);
  if (!userId) {
    await department.setUser(null);
  } else {
    const user = await schoolScope(UserModel).findByPk(userId);
    if (!user) {
      return resError(res, 400, 'DATA_NOT_FOUND', "No s'ha trobat l'usuari Director d'aquest departament.");
    }

    if (!hasPermissions(currentUserData.role, user.role)) {
      return resError(
        res,
        403,
        'NO_PERMISSIONS',
        'No disposes dels permisos suficients per fer aquesta assignació.'
      );
    }

    await department.setUser(user);
  }

  res.json(department);
};
