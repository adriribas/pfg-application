import config from 'config';

if (!config.get('jwt.key')) {
  throw new Error('Json Web Token private key is not defined');
}

export default {};
