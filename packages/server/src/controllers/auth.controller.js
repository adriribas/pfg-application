import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import jsonfile from 'jsonfile';
import createDebugger from 'debug';

import { User as UserModel } from '#r/models';
import { reqProcessing, emailUtil } from '#r/utils';

const { resError } = reqProcessing;
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

export const resetPassword = async (req, res) => {
  const user = await UserModel.findOne({
    where: { email: req.body.email }
  });
  if (!user) {
    return resError(res, 400, 'INVALID_DATA', `User with email ${req.body.email} does not exist.`);
  }

  const sendingResults = await emailUtil.sendEmail(
    user.email,
    await jsonfile.readFile(`resources/emailTemplates/${config.get('email.templates.resetPassword')}.json`),
    {
      link: `${req.headers.origin}/new-password?token=${user.generateResetPasswordJwt()}`,
      firstName: user.firstName,
      lastName: user.lastName
    }
  );

  debug('Sending results: %o', sendingResults);

  res.json(user.generateResetPasswordJwt());
};

export const newPassword = async (req, res) => {
  const { token, secret } = req.body;
  let userId;

  try {
    userId = jwt.verify(token, config.get('jwt.resetPassword.key')).id;
  } catch (e) {
    debug('Reset password invalid token: %s', e.message);
    return resError(res, 400, 'INVALID_TOKEN', 'Provided token is invalid or has expired.');
  }

  try {
    await UserModel.validateSecret(secret);
  } catch (e) {
    debug('Reset password complexity error: %s', e.message);
    const isLengthError = e.details.some(({ type }) => type.includes('tooShort') || type.includes('tooLong'));
    return resError(
      res,
      400,
      isLengthError ? 'PWD_LENGTH' : 'PWD_COMPLEXITY',
      isLengthError ? 'Invalid password length.' : 'Password complexity is too low.'
    );
  }

  if (!(await UserModel.update({ secret }, { where: { id: userId } }))[0]) {
    debug('User with id %s not found', userId);
    return resError(res, 400, 'INVALID_TOKEN', 'The user encrypted in provided token does not exist.');
  }

  res.send(true);
};
