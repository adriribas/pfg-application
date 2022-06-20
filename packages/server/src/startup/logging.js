import 'express-async-errors';
import winston from 'winston';

process.on('uncaughtException', ex => winston.error(ex.message, ex));
process.on('unhandledRejection', ex => winston.error(ex.message, ex));

winston.exceptions.handle(new winston.transports.File({ filename: './logs/unhandledExceptions.log' }));
winston.rejections.handle(new winston.transports.File({ filename: './logs/unhandledRejections.log' }));

winston.add(new winston.transports.File({ filename: './logs/logfile.log' }));
