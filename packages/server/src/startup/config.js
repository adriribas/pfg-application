import config from 'config';

const np = config.get('np');
if (!np) {
  throw new Error('App source root path is not defined');
}
global.np = np;

if (!config.get('jwt.key')) {
  throw new Error('Json Web Token private key is not defined');
}

export default {};
