import config from 'config';
import createDebugger from 'debug';
import express from 'express';

import * as startup from './startup';

const app = express();
const debug = createDebugger('pfgs:startup');

debug(`Running process: ${config.get('name')}`);

app.set('port', process.env.PORT || 8000);

startup.routing(app);

app.listen(app.get('port'), () => debug(`Express application listening on port ${app.get('port')}`));
