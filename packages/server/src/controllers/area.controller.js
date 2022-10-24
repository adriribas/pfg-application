import _ from 'lodash';
import createDebugger from 'debug';

import { Area as Model, User as UserModel } from '#r/models';
import { reqProcessing, usersUtil } from '#r/utils';

const { buildWhere, isValidUpdateData, updateFields, resError } = reqProcessing;
const { hasPermissions } = usersUtil;
const debug = createDebugger('pfgs:areaController');

export const get = async (req, res) => {
  const {
    scopes: { department: departamentScope },
    query: { fields },
    params: { abv }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'àrea.");
  }

  const area = await departamentScope(Model).findByPk(abv, { attributes: fields });
  if (!area) {
    return resError(res, 404);
  }

  res.json(area);
};

export const filter = async (req, res) => {
  const {
    scopes: { department: departamentScope },
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await departamentScope(Model).findAll({
      where: buildWhere(filterData),
      attributes: fields
    })
  );
};

export const update = async (req, res) => {
  const {
    user: currentUserData,
    scopes: { school: schoolScope, department: departamentScope },
    params: { abv },
    body: data
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'àrea.");
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', "Les dades per actualitzar l'àrea no són vàlides.");
  }

  const area = await departamentScope(Model).findByPk(abv);
  if (!area) {
    return resError(res, 404);
  }

  const { responsable: userId, ...attributes } = data;
  await updateFields(area, attributes);
  if (!userId) {
    await area.setUser(null);
  } else {
    const user = await schoolScope(UserModel).findByPk(userId);
    if (!user) {
      return resError(
        res,
        400,
        'DATA_NOT_FOUND',
        "No s'ha trobat l'usuari Responsable de la docència d'aquesta àrea."
      );
    }

    if (!hasPermissions(currentUserData.role, user.role)) {
      return resError(
        res,
        403,
        'NO_PERMISSIONS',
        'No disposes dels permisos suficients per fer aquesta assignació.'
      );
    }

    await area.setUser(user);
  }

  res.json(area);
};
