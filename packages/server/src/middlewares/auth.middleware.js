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
    return resError(res, 401, 'TOKEN_NOT_PROVIDED', "No s'ha proporcionat el token d'autorització.");
  }

  try {
    const { id: userId } = UserModel.verifyAuthToken(token);

    const user = await UserModel.findByPk(userId);
    if (!user) {
      return resError(res, 401, 'DELETED_USER', "L'usuari ha estat eliminat.");
    }

    if (!user.activated) {
      return resError(res, 400, 'NOT_ACTIVE_USER', "L'usuari encara no ha estat activat.");
    }

    req.user = await getReqPipelineUserData(user);
  } catch (e) {
    debug('Invaild token', token, e.message);
    return resError(
      res,
      400,
      'INVALID_TOKEN',
      "El token d'autorització proporcionat no és vàlid o bé ha expirat."
    );
  }

  next();
};
