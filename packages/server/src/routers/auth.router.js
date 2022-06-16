import express from 'express';

import { authController as controller } from '../controllers';

const router = express.Router();

router.post('/', controller.login);

export default router;
