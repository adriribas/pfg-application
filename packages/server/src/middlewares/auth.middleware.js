import jwt from 'jsonwebtoken';
import config from 'config';

export const auth = (req, res, next) => {
  const token = req.header('X-auth-token');
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }
  try {
    req.user = jwt.verify(token, config.get('jwt.key'));
    next();
  } catch (e) {
    res.status(400).send('Invalid token.');
  }
};
