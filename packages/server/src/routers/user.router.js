import express from 'express';

import { userController as controller } from '../controllers';

const router = express.Router();

router.get('/:id', controller.get);

router.get('/', controller.getAll);

router.post('/', controller.create);

router.put('/:id', controller.update);

router.delete('/:id', controller.destroy);

export default router;
