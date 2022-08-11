import express from 'express';
import morgan from 'morgan';
import createDebugger from 'debug';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from 'config';
// express-stormpath, passport

import { reqProcessing, errorHandling } from '#r/middlewares';
import apiRouter from '#r/routes';

const debug = createDebugger('pfgs:routingStartup');

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
    debug('Morgan middleware for logging requests is enabled');
  }
  app.use(reqProcessing.requestFormatter);

  app.use('/api', apiRouter);

  app.use(errorHandling.handler);
};
