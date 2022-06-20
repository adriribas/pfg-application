import winston from 'winston';

export const error = (err, _req, res, _next) => {
    winston.error(err.message, err);
    res.status(500).send('Something went wrong');
};
