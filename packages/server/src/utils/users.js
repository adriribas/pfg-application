import config from 'config';

export const hasPermissions = (currentUserRole, otherUserRole) =>
  config.get(`userPermissions.${currentUserRole}`)?.includes(otherUserRole);
