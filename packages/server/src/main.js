import config from 'config';
import createDebugger from 'debug';
import express from 'express';

import * as startup from './startup';
import * as models from './models';

const app = express();
const debug = createDebugger('pfgs:startup');

debug(`Running process: ${config.get('name')}`);

app.set('port', process.env.PORT || 8000);

startup.routing(app);

//console.log('Models:', Object.values(models));
Object.values(models).forEach(model => model.associate && model.associate(models));

app.listen(app.get('port'), () => debug(`Express application listening on port ${app.get('port')}`));
