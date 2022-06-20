import winston from 'winston';
import 'express-async-errors';

const consoleTransport = new winston.transports.Console({ colorize: true, prettyPrint: true });

winston.exceptions.handle(new winston.transports.File({ filename: './logs/unhandledExceptions.log' }), consoleTransport);
//winston.rejections.handle(new winston.transports.File({ filename: './logs/unhandledRejections.log' }), consoleTransport);

winston.add(new winston.transports.File({ filename: './logs/logfile.log' }));

export default null;
