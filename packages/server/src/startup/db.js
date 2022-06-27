import Sequelize from 'sequelize';
import _ from 'lodash';
import config from 'config';
import debug from 'debug';

const dbDebugger = debug('pfgs:db');

//const sequelize = new Sequelize(config.get('db.schema'), config.get('db.user'), config.get('db.secret'), config.get('connection'));

const sequelize = new Sequelize(config.get('db.schema'), 'root', 'pfg', config.get('db.connection'));

(async () => {
  dbDebugger('Establishing connection with database...');
  await sequelize.sync({ force: true });
  dbDebugger('Connection has been established successfully');
})();

export default sequelize;
