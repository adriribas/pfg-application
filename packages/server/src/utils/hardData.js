import config from 'config';
import jsonfile from 'jsonfile';
import createDebugger from 'debug';

const debug = createDebugger('pfgs:hardDataUtil');

export const getValue = (resource, key) => {
  try {
    const data = jsonfile.readFileSync(`resources/hardData/${config.get(`hardData.${resource}`)}.json`);
    return data[key] || null;
  } catch (e) {
    debug(`Error getting value ${key} from ${resource} JSON resource`, e);
    return null;
  }
};
