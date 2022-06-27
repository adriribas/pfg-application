import config from 'config';

if (!config.get('jwtPrivateKey')) {
  throw new Error('jwtPrivateKey is not defined');
}

export default {};
