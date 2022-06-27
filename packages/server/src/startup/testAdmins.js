import config from 'config';
import debug from 'debug';
import bcrypt from 'bcrypt';
import _ from 'lodash';

import { User as UserModel } from '../models';

const testAdminsDebugger = debug('pfgs:testAdmins');

(async () => {
  testAdminsDebugger('Populating db with testing admin users');
  await Promise.all(
    config.get('administratorUsers').map(async user => {
      const userData = _.pick(user, ['firstName', 'lastName', 'email', 'secret', 'role']);
      userData.secret = await bcrypt.hash(userData.secret, await bcrypt.genSalt(12));
      return UserModel.create(userData);
    })
  );
  testAdminsDebugger('Default administrator users have been created successfully');
})();

export default {};
