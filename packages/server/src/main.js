import express from 'express';
import createDebugger from 'debug';

import * as startup from './startup';
import * as models from './models';

const app = express();
const debug = createDebugger('pfgs:startup');

app.set('port', process.env.PORT || 8000);

startup.routing(app);

Object.values(models).forEach(model => model.associate && model.associate(models));

app.listen(app.get('port'), () => debug(`Express application listening on port ${app.get('port')}`));
