import express from 'express';

import { authController as controller } from '#r/controllers';
import { authorization, reqProcessing } from '#r/middlewares';

const { logIn, getCurrentUser, assertAccessTo, resendEmailConfirmation, resetPassword, newPassword } =
  controller;
const { auth } = authorization;
const { generateScopes } = reqProcessing;

const router = express.Router();

router.post('/', logIn);
router.get('/current-user', auth, getCurrentUser);
router.get('/access/:view', assertAccessTo);
router.post('/resend-email-confirmation', auth, generateScopes, resendEmailConfirmation);
router.post('/reset-password', resetPassword);
router.post('/new-password', newPassword);

export default router;
