import express from 'express';

import { authController as controller } from '../controllers';
import * as middlewares from '../middlewares';

const router = express.Router();

router.post('/', controller.logIn);

router.get('/current-user', middlewares.auth, controller.getCurrentUser);

router.get('/access/:view', controller.assertAccessTo);

router.post('/reset-password', controller.resetPassword);

router.post('/new-password', controller.newPassword);

export default router;
