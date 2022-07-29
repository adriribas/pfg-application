import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import jsonfile from 'jsonfile';
import createDebugger from 'debug';

import { User as UserModel } from '#r/models';
import { emailUtil } from '#r/utils';

const debug = createDebugger('pfgs:auth');

const getToSendUserData = user => ({
  ..._.pick(user, 'firstName', 'lastName', 'email', 'role'),
  defaultView: config.get('userRoles').find(({ role }) => role === user.role).views[0]
});

export const logIn = async (req, res) => {
  try {
    await UserModel.validateAuth(req.body);
  } catch (e) {
    return res.status(400).send(e.message);
  }

  const user = await UserModel.findOne({
    where: { email: req.body.email }
  });
  if (!user) {
    return res.status(400).send('Invalid email or password');
  }

  const validSecret = await bcrypt.compare(req.body.secret, user.secret);

  if (!validSecret) {
    return res.status(400).send('Invalid email or password');
  }

  res.json({
    userData: getToSendUserData(user),
    token: user.generateAuthJwt()
  });
};

export const getCurrentUser = (req, res) => res.json(getToSendUserData(req.user));

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
    return res.status(403).send('The view is forbidden.');
  }

  res.json(true);
};

export const resetPassword = async (req, res) => {
  const user = await UserModel.findOne({
    where: { email: req.body.email }
  });
  if (!user) {
    res.status(400).send('Invalid email.');
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
    return res.status(400).json({ code: 'ERR_TOKEN', desc: 'Invalid token' });
  }

  try {
    await UserModel.validateSecret(secret);
  } catch (e) {
    debug('Reset password complexity error: %s', e.message);
    const isLengthError = e.details.some(({ type }) => type.includes('tooShort') || type.includes('tooLong'));
    return res.status(400).json({
      code: isLengthError ? 'ERR_PWD_LENGTH' : 'ERR_PWD_COMPLEXITY',
      desc: isLengthError ? 'Length error' : 'Complexity error'
    });
  }

  if (!(await UserModel.update({ secret }, { where: { id: userId } }))[0]) {
    debug('User with id %s not found', userId);
    return res.status(400).json({ code: 'ERR_USER', desc: 'User not found' });
  }

  res.send(true);
};
