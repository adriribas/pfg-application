import bcrypt from 'bcrypt';
import _ from 'lodash';

import { User as Model } from '../models';

export const login = async (req, res) => {
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

  res.send({
    userData: _.pick(user, 'firstName', 'lastName', 'email', 'role'),
    token: user.generateJsonWebToken()
  });

  //res.header('X-auth-token', User.generateJsonWebToken()).send(true);
};
