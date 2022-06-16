import 'express-async-errors';
import config from 'config';
import debug from 'debug';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import winston from 'winston';
// express-stormpath, passport, joi-password-complexity

import * as middlewares from './src/middlewares';
import * as routers from './src/routers';

winston.add(new winston.transports.File({ filename: './logs/logfile.log' }));

const startupDebugger = debug('pfgs:startup'),
    port = process.env.PORT || 8000,
    app = express(),
    nodeEnv = app.get('env');

if (!config.get('jwtPrivateKey')) {
    log.error('jwtPrivateKey is not defined');
    process.exit(1);
}

startupDebugger(`\nRunning process: ${config.get('name')}\n`);

app.use(helmet());
app.use(express.json());
//app.use(cors());
app.use(cookieParser());
if (nodeEnv === 'development') {
    app.use(morgan('dev'));
    startupDebugger('Morgan middleware for logging requests is enabled');
}

app.use('/api/auth', routers.authRouter);

// Custom middlewares
app.use(middlewares.auth);

// API routing

app.use('/api/users', routers.userRouter);

app.use(middlewares.error);

app.listen(port, () => startupDebugger(`Express application listening on port ${port}`));
