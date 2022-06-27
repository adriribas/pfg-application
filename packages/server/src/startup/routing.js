import express from 'express';
import morgan from 'morgan';
import debug from 'debug';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from 'config';
// express-stormpath, passport

import * as middlewares from '../middlewares';
import * as routers from '../routers';

const startupDebugger = debug('pfgs:startup');

export default app => {
  app.use(helmet());
  app.use(express.json());
  app.use(
    cors({
      origin: config.get('clientDomain'),
      optionsSuccessStatus: 200
    })
  );
  app.use(cookieParser());

  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
    startupDebugger('Morgan middleware for logging requests is enabled');
  }

  app.use('/api/auth', routers.authRouter);
  app.use(middlewares.auth);
  app.use('/api/users', routers.userRouter);
  app.use(middlewares.error);
};
