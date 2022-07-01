import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';

import { User as Model } from '../models';

const getToSendUserData = user => ({
  ..._.pick(user, 'firstName', 'lastName', 'email', 'role'),
  defaultView: config.get('userRoles').find(({ role }) => role === user.role).views[0]
});

export const logIn = async (req, res) => {
  try {
    await Model.validateAuth(req.body);
  } catch (e) {
    return res.status(400).send(e.message);
  }

  const user = await Model.findOne({
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
    token: user.generateJsonWebToken()
  });
};

export const getCurrentUser = (req, res) => res.json(getToSendUserData(req.user));

export const assertAccessTo = (req, res) => {
  let views = [];
  try {
    const { role: userRole } = jwt.verify(req.header('X-auth-token'), config.get('jwtPrivateKey'));
    views = config.get('userRoles').find(({ role }) => role === userRole).views;
  } catch (e) {
    views = config.get('noAuthViews');
  }

  if (!views.includes(req.params.view)) {
    return res.status(403).send('The view is forbidden.');
  }

  res.json(true);
};
