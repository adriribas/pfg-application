import _ from 'lodash';
import createDebugger from 'debug';

import { Area as Model, User as UserModel } from '#r/models';
import { reqProcessing, usersUtil } from '#r/utils';

const { buildWhere, updateFields, resError } = reqProcessing;
const { hasPermissions } = usersUtil;
const debug = createDebugger('pfgs:areaController');

export const get = async (req, res) => {
  const {
    scopes: { department: departamentScope },
    query: { fields },
    params: { abv }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Area key not provided.');
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
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Area key not provided.');
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'The data to update is not valid.');
  }

  const area = await departamentScope(Model).findByPk(abv);
  if (!area) {
    return resError(res, 404);
  }

  const { responsable: userId, ...attributes } = data;
  await updateFields(area, attributes);
  if (!userId) {
    await area.setResponsable(null);
  } else {
    const user = await schoolScope(UserModel).findByPk(userId);
    if (!user) {
      return resError(res, 400, 'DATA_NOT_FOUND', 'Responsable user not found.');
    }

    if (!hasPermissions(currentUserData.role, user.role)) {
      return resError(res, 403, 'NO_PERMISSIONS', 'Current user cannot assign the other user.');
    }

    await area.setUser(user);
  }

  res.json(area);
};
