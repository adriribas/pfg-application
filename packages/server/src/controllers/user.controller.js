import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';
import jsonfile from 'jsonfile';
import config from 'config';

import { reqProcessing, usersUtil, emailUtil } from '#r/utils';
import { User as Model, School as SchoolModel } from '#r/models';

const { buildWhere, resError, isDuplicationError } = reqProcessing;
const { hasCreationPermissions } = usersUtil;
const { sendEmail } = emailUtil;
const debug = createDebugger('pfgs:userController');

const schoolScope = ({ school: schoolAbv }) => Model.scope({ method: ['school', schoolAbv] });

export const get = async (req, res) => {
  const {
    user: currentUserData,
    params: { id },
    query: { fields }
  } = req;
  if (!id) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'User key not provided.');
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

  if (!hasCreationPermissions(currentUserData.role, data.role)) {
    resError(res, 403, 'NO_PERMISSIONS', 'Current user can not create a user with this data.');
  }

  const userData = _.pick(data, ['firstName', 'lastName', 'email', 'role']);
  try {
    await Model.validate(userData);
  } catch (e) {
    debug('Error user creation', e);
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  let user;
  try {
    user = await Model.create(userData);
  } catch (e) {
    if (!isDuplicationError(e)) {
      throw e;
    }
    return resError(res, 400, 'DUPLICATION', 'This user does already exist.');
  }

  const school = await SchoolModel.findByPk(currentUserData.school);
  await user.setSchool(school);

  await sendEmail(
    user.email,
    await jsonfile.readFile(
      `resources/emailTemplates/${config.get('email.templates.emailConfirmation')}.json`
    ),
    {
      link: `${origin}/new-password?token=${user.generateEmailConfirmationJwt()}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdByName: currentUserData.firstName,
      createdByLastName: currentUserData.lastName,
      school: school.name
    }
  );

  res.status(201).json(user);
};

//********************************************************************/

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

export const destroy = async (req, res) => {
  const deletedRows = Model.destroy({
    where: { id: req.params.id }
  });
  if (!deletedRows) {
    return res.status(404).send(`[ERROR]: User with id "${req.params.id}" does not exist`);
  }

  res.send({ id: req.params.id });
};
