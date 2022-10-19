import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import createDebugger from 'debug';

import { User as UserModel, School as SchoolModel } from '#r/models';
import { reqProcessing, usersUtil, emailUtil } from '#r/utils';

const { resError } = reqProcessing;
const { hasPermissions } = usersUtil;
const { sendEmailConfirmationEmail, sendResetPasswordEmail } = emailUtil;
const debug = createDebugger('pfgs:auth');

const getToSendUserData = user => ({
  ..._.pick(user, 'firstName', 'lastName', 'email', 'school', 'role'),
  defaultView: config.get('userRoles').find(({ role }) => role === user.role).views[0]
});

export const logIn = async (req, res) => {
  try {
    await UserModel.validateAuth(req.body);
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  const user = await UserModel.findOne({
    where: { email: req.body.email }
  });
  if (!user) {
    return resError(res, 400, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const validSecret = await bcrypt.compare(req.body.secret, user.secret);

  if (!validSecret) {
    return resError(res, 400, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  res.json({
    userData: getToSendUserData(user),
    token: user.generateAuthJwt()
  });
};

export const getCurrentUser = (req, res) => res.json(getToSendUserData(req.user)); // TO-DO: Comprovar que l'usuari existeixi a la base de dades (per si s'ha eliminat o ha canviat)

export const assertAccessTo = (req, res) => {
  let views = config.get('noAuthViews');
  try {
    const token = req.header('Authorization');
    debug({ token });
    if (token) {
      const { role: userRole } = UserModel.verifyAuthToken(token);
      views = config.get('userRoles').find(({ role }) => role === userRole).views;
    }
  } catch (e) {
    debug('Error', e);
    views = config.get('noAuthViews');
  }

  if (!views.includes(req.params.view)) {
    return resError(res, 403, 'FORBIDDEN_VIEW', `View ${req.params.view} is forbidden.`);
  }

  res.json(true);
};

export const resendEmailConfirmation = async (req, res) => {
  const {
    user: currentUserData,
    scopes: { school: schoolScope },
    headers: { origin },
    body: { id: userId }
  } = req;
  if (!userId) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'User key not provided.');
  }

  const user = await schoolScope(UserModel).findByPk(userId);
  if (!user) {
    return resError(res, 400, 'DATA_NOT_FOUND', 'User not found.');
  }

  if (!hasPermissions(currentUserData.role, user.role)) {
    return resError(
      res,
      403,
      'NO_PERMISSIONS',
      'Current user cannot resend email confirmation email to the other user.'
    );
  }

  const school = await SchoolModel.findByPk(currentUserData.school);

  await sendEmailConfirmationEmail(user, currentUserData, school || {}, origin);
  await user.update({ activated: false });

  res.json();
};

export const resetPassword = async (req, res) => {
  const {
    headers: { origin },
    body: { email }
  } = req;

  const user = await UserModel.findOne({
    where: { email }
  });
  if (!user) {
    return resError(res, 400, 'INVALID_DATA', `User with email ${email} does not exist.`);
  }

  await sendResetPasswordEmail(user, origin);
  await user.update({ secret, activated: false });

  res.json();
};

export const newPassword = async (req, res) => {
  const {
    body: { reason, token, secret } // Reason: resetPassword or emailConfirmation
  } = req;
  let userId;

  try {
    userId = jwt.verify(token, config.get(`jwt.${reason}.key`)).id;
  } catch (e) {
    debug('Invalid token: %s', e.message);
    return resError(res, 400, 'INVALID_TOKEN', 'Provided token is invalid or has expired.');
  }

  const user = await UserModel.findByPk(userId);
  if (!user) {
    debug('User %s not found', userId);
    return resError(res, 400, 'INVALID_TOKEN', 'The encrypted user in provided token not exists.');
  }

  try {
    await UserModel.validateSecret(secret);
  } catch (e) {
    debug('Password complexity error: %s', e.message);
    const isLengthError = e.details.some(({ type }) => type.includes('tooShort') || type.includes('tooLong'));
    return resError(
      res,
      400,
      isLengthError ? 'PWD_LENGTH' : 'PWD_COMPLEXITY',
      isLengthError ? 'Invalid password length.' : 'Password complexity is too low.'
    );
  }

  await user.update({ secret, activated: true });

  res.json(true);
};
