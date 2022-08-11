import createDebugger from 'debug';

import { User as UserModel } from '#r/models';
import { reqProcessing } from '#r/utils';

const { resError } = reqProcessing;
const debug = createDebugger('pfgs:authMiddleware');

export const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    debug('Token not provided');
    return resError(res, 401, 'TOKEN_NOT_PROVIDED', 'Authorization token has not been provided.');
  }

  try {
    req.user = UserModel.verifyAuthToken(token);
  } catch (e) {
    debug('Invaild token', token, e.message);
    return resError(res, 400, 'INVALID_TOKEN', 'Authorization token is invalid or has expired.');
  }

  next();
};
