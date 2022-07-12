import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import jsonfile from 'jsonfile';
import createDebugger from 'debug';

import { User as UserModel } from '../models';
import { emailUtil } from '../utils';

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
  let views = [];
  try {
    const { role: userRole } = jwt.verify(req.header('X-auth-token'), config.get('jwt.key'));
    views = config.get('userRoles').find(({ role }) => role === userRole).views;
  } catch (e) {
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

  emailUtil.sendEmail(
    user.email,
    await jsonfile.readFile(`resources/emailTemplates/${config.get('email.templates.resetPassword')}.json`),
    { token: user.generateResetPasswordJwt(), firstName: user.firstName, lastName: user.lastName }
  );

  res.json(user.generateResetPasswordJwt());
};

export const newPassword = async (req, res) => {
  const { token, secret } = req.body;
  let userId;

  try {
    userId = jwt.verify(token, config.get('jwt.key')).id;
  } catch (e) {
    debug('Reset password invalid token: %s', e.message);
    return res.status(400).send('Invalid token.');
  }

  try {
    console.log('Result validation:', await UserModel.validateSecret(secret));
  } catch (e) {
    debug('Reset password complexity error: %s', e.message);
    return res.status(400).send(e.message);
  }

  if (!(await UserModel.update({ secret }, { where: { id: userId } }))[0]) {
    return res.status(400).send('User not found.');
  }

  res.send(true);
};
