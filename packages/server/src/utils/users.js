import config from 'config';
import _ from 'lodash';

export const hasPermissions = (currentUserRole, otherUserRole) =>
  config.get(`userPermissions.${currentUserRole}`)?.includes(otherUserRole);

const getRelationalData = async (user, entityName, fields) => {
  const entity = await user[`get${_.capitalize(entityName)}`]();

  return entity ? { [entityName]: _.pick(entity, fields) } : {};
};

const roleSpecificUserDataGetters = {
  Administrador: () => ({}),
  Coordinador: user => getRelationalData(user, 'study', ['abv', 'name']),
  'Director de departament': user => getRelationalData(user, 'department', ['abv', 'name']),
  'Responsable de docencia': user => ({}),
  Professor: user => ({})
};

export const getToSendUserData = async user => ({
  ..._.pick(user, 'firstName', 'lastName', 'email', 'school', 'role'),
  ...(await roleSpecificUserDataGetters[user.role](user)),
  defaultView: config.get('userRoles').find(({ role }) => role === user.role).views[0]
});

export const getReqPipelineUserData = async user => ({
  ..._.pick(user, 'id', 'activated', 'firstName', 'lastName', 'email', 'school', 'role'),
  ...(await roleSpecificUserDataGetters[user.role](user))
});
