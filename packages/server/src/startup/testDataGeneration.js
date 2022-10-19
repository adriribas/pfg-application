import config from 'config';
import createDebugger from 'debug';
import _ from 'lodash';

import { School as SchoolModel, User as UserModel } from '#r/models';

const debug = createDebugger('pfgs:testDataGeneration');

const bulkCreate = async (Model, entityName) => {
  debug(`Generating ${entityName} data...`);
  try {
    await Model.bulkCreate(config.get(entityName));
    debug(`${entityName} data has been generated`);
  } catch (e) {
    debug(`${entityName} data not generated:`, e.message);
  }
};

const createSchools = () => bulkCreate(SchoolModel, 'schools');

const createUsers = () => bulkCreate(UserModel, 'administratorUsers');

export default async () => {
  await createSchools();
  await createUsers();
};
