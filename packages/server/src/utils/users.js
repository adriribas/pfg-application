import config from 'config';

export const hasCreationPermissions = (currentUserRole, newUserRole) =>
  config.get(`userCreationPermissions.${currentUserRole}`)?.includes(newUserRole);
