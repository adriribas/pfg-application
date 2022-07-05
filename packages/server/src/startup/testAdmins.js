import config from 'config';
import createDebugger from 'debug';
import _ from 'lodash';

import { User as UserModel } from '../models';

const debug = createDebugger('pfgs:testAdmins');

setTimeout(async () => {
  debug('Populating db with testing admin users');
  await UserModel.bulkCreate(config.get('administratorUsers'));
  debug('Default administrator users have been created successfully');
}, 600);

export default {};
