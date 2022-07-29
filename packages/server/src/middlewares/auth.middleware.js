import jwt from 'jsonwebtoken';
import config from 'config';

import { User as UserModel } from '#r/models';

export const auth = (req, res, next) => {
  //const token = req.header('X-auth-token');
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ code: 'ERR_NO_TOKEN' });
  }
  try {
    //req.user = jwt.verify(token, config.get('jwt.auth.key'));
    req.user = UserModel.verifyAuthToken(token);
    next();
  } catch (e) {
    console.log('Invaild token', e);
    res.status(400).json({ code: 'ERR_INVALID_TOKEN' });
  }
};
