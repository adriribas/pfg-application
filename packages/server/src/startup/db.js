import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import debug from 'debug';

import { User as UserModel } from '../models';

const dbDebugger = debug('pfgs:db');

//const sequelize = new Sequelize(config.get('db.schema'), config.get('db.user'), config.get('db.secret'), config.get('connection'));

const sequelize = new Sequelize(config.get('db.schema'), 'root', 'pfg', config.get('db.connection'));

dbDebugger('Establishing connection with database...');

(async () => {
    await sequelize.sync({ force: true });
    dbDebugger('Connection has been established successfully');

    await Promise.all(config.get('administratorUsers').map(async user => {
        const userData = _.pick( user, ['firstName', 'lastName', 'email', 'secret', 'role']);
        userData.secret = await bcrypt.hash(userData.secret, await bcrypt.genSalt(12));
        return UserModel.create(userData);
    }));
    dbDebugger('Default administrator users have been created successfully');
})();

export default sequelize;
