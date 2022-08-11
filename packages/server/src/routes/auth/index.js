import express from 'express';

import { authController as controller } from '#r/controllers';
import { authorization } from '#r/middlewares';

const router = express.Router();

router.post('/', controller.logIn);

router.get('/current-user', authorization.auth, controller.getCurrentUser);

router.get('/access/:view', controller.assertAccessTo);

router.post('/reset-password', controller.resetPassword);

router.post('/new-password', controller.newPassword);

export default router;
