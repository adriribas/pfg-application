import config from 'config';
import debug from 'debug';
import express from 'express';
// express-stormpath, passport

import * as startup from './src/startup';

const app = express(),
    port = process.env.PORT || 8000,
    startupDebugger = debug('pfgs:startup');

startup.routes(app);

startupDebugger(`\nRunning process: ${config.get('name')}\n`);

app.listen(port, () => startupDebugger(`Express application listening on port ${port}`));
