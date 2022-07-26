import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

(async () => {
  const { default: config } = await import('config');

  if (!config.has('jwt.auth.key')) {
    throw new Error('[Auth] Json Web Token private key is not defined');
  }
  if (!config.has('jwt.resetPassword.key')) {
    throw new Error('[Reset password] Json Web Token private key is not defined');
  }
})();

export default {};
