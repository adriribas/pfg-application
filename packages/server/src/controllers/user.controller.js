import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing, usersUtil, emailUtil } from '#r/utils';
import { User as Model, School as SchoolModel } from '#r/models';

const { buildWhere, resError } = reqProcessing;
const { hasPermissions } = usersUtil;
const { sendEmailConfirmationEmail } = emailUtil;
const debug = createDebugger('pfgs:userController');

const schoolScope = ({ school: schoolAbv }) => Model.scope({ method: ['school', schoolAbv] });

export const get = async (req, res) => {
  const {
    user: currentUserData,
    params: { id },
    query: { fields }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'usuari");
  }

  const user = await schoolScope(currentUserData).findByPk(id, { attributes: fields });

  if (!user) {
    return resError(res, 404);
  }

  res.json(user);
};

export const filter = async (req, res) => {
  const {
    user: currentUserData,
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await schoolScope(currentUserData).findAll({
      where: buildWhere(filterData),
      attributes: fields
    })
  );
};

export const create = async (req, res) => {
  const {
    headers: { origin },
    user: currentUserData,
    body: data
  } = req;

  if (!hasPermissions(currentUserData.role, data.role)) {
    return resError(
      res,
      403,
      'NO_PERMISSIONS',
      'No disposes dels permisos suficients per crear aquest usuari.'
    );
  }

  const userData = _.pick(data, ['firstName', 'lastName', 'email', 'role']);
  try {
    await Model.validate(userData);
  } catch (e) {
    debug('Error user creation', e);
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  let user = await Model.findOne({ where: { email: data.email }, paranoid: false });
  if (!user) {
    user = await Model.create(userData);
  } else {
    if (!user.isSoftDeleted()) {
      return resError(res, 400, 'DUPLICATION', 'Ja existeix un usuari amb aquest correu electrònic.');
    }
    await user.restore();
    if (user.activated) {
      await user.update({ activated: false });
    }
  }

  const school = await SchoolModel.findByPk(currentUserData.school);
  await user.setSchool(school);

  await sendEmailConfirmationEmail(user, currentUserData, school, origin);

  res.status(201).json(user);
};

export const remove = async (req, res) => {
  const {
    user: currentUserData,
    params: { id }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'usuari");
  }

  const user = await schoolScope(currentUserData).findByPk(id);
  if (!user) {
    return resError(res, 404);
  }

  if (!hasPermissions(currentUserData.role, user.role)) {
    return resError(
      res,
      403,
      'NO_PERMISSIONS',
      'No disposes dels permisos suficients per eliminar aquest usuari.'
    );
  }

  await user.destroy();

  res.status(204).json();
};

//********************************************************************//

export const update = async (req, res) => {
  try {
    await Model.validate(req.body);
  } catch (e) {
    return res.status(400).send(e.message);
  }

  const updatedRows = await Model.update(req.body, {
    where: { id: req.params.id }
  });
  if (!updatedRows) {
    return res.status(404).send(`[ERROR]: User with id "${req.params.id}" does not exist`);
  }
};
