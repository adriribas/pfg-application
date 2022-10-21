import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import createDebugger from 'debug';

import { User as UserModel, School as SchoolModel } from '#r/models';
import { reqProcessing, usersUtil, emailUtil } from '#r/utils';

const { resError } = reqProcessing;
const { hasPermissions, getToSendUserData } = usersUtil;
const { sendEmailConfirmationEmail, sendResetPasswordEmail } = emailUtil;
const debug = createDebugger('pfgs:auth');

export const logIn = async (req, res) => {
  const { body: authData } = req;

  try {
    await UserModel.validateAuth(authData);
  } catch (e) {
    return resError(res, 400, 'INVALID_DATA', e.message);
  }

  const user = await UserModel.findOne({
    where: { email: authData.email }
  });
  if (!user?.activated) {
    return resError(res, 400, 'INVALID_CREDENTIALS', 'Invalid email or password or the user is not active.');
  }

  const validSecret = await bcrypt.compare(authData.secret, user.secret);

  if (!validSecret) {
    return resError(res, 400, 'INVALID_CREDENTIALS', 'Invalid email or password or the user is not active.');
  }

  res.json({ userData: await getToSendUserData(user), token: user.generateAuthJwt() });
};

export const getCurrentUser = async (req, res) => {
  const {
    user: { id: userId }
  } = req;

  res.json(await getToSendUserData(await UserModel.findByPk(userId)));
};

export const assertAccessTo = (req, res) => {
  const {
    headers: { authorization: token },
    params: { view }
  } = req;

  let views = config.get('noAuthViews');
  if (token) {
    try {
      const { role: userRole } = UserModel.verifyAuthToken(token);
      views = config.get('userRoles').find(({ role }) => role === userRole).views;
    } catch (e) {
      debug('Error', e);
    }
  }

  if (!views.includes(view)) {
    return resError(res, 403, 'FORBIDDEN_VIEW', `View ${view} is forbidden.`);
  }

  res.json();
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
  await user.update({ activated: false });

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

  if (user.activated) {
    debug('User %s is already active.', userId);
    return resError(res, 400, 'ACTIVE_USER', 'User is already active.');
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

  res.json();
};
