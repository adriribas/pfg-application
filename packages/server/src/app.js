import config from 'config';
import debug from 'debug';
import express from 'express';

import * as startup from './startup';

const app = express(),
  startupDebugger = debug('pfgs:startup');

startupDebugger(`Running process: ${config.get('name')}`);

app.set('port', process.env.PORT || 8000);

startup.routing(app);

app.listen(app.get('port'), () => startupDebugger(`Express application listening on port ${app.get('port')}`));
