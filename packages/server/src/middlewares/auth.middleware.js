import createDebugger from 'debug';

import { User as UserModel } from '#r/models';
import { reqProcessing, usersUtil } from '#r/utils';

const { resError } = reqProcessing;
const { getReqPipelineUserData } = usersUtil;
const debug = createDebugger('pfgs:authMiddleware');

export const auth = async (req, res, next) => {
  const {
    headers: { authorization: token }
  } = req;

  if (!token) {
    debug('Token not provided');
    return resError(res, 401, 'TOKEN_NOT_PROVIDED', 'Authorization token has not been provided.');
  }

  try {
    const { id: userId } = UserModel.verifyAuthToken(token);

    const user = await UserModel.findByPk(userId);
    if (!user) {
      return resError(res, 401, 'DELETED_USER', 'This user has been deleted.');
    }

    if (!user.activated) {
      return resError(res, 400, 'NOT_ACTIVE_USER', 'This user is not active.');
    }

    req.user = await getReqPipelineUserData(user);
  } catch (e) {
    debug('Invaild token', token, e.message);
    return resError(res, 400, 'INVALID_TOKEN', 'Authorization token is invalid or has expired.');
  }

  next();
};
