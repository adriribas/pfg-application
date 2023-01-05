import Sequelize from 'sequelize';
import _ from 'lodash';
import config from 'config';
import createDebugger from 'debug';
import winston from 'winston';

import { generateTestData } from '.';

const debug = createDebugger('pfgs:db');

const sequelize = new Sequelize(
  config.get('db.schema'),
  config.get('db.user'),
  config.get('db.secret'),
  config.get('db.connection')
);

const sqlLogger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.File({ filename: './logs/sql.log' })]
});

(async () => {
  debug('Establishing connection with database...');
  await sequelize.sync({ force: false, logging: msg => sqlLogger.log('info', msg) });
  debug('Connection has been established successfully');
  generateTestData();
})();

export default sequelize;
