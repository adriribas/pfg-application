import express from 'express';

import { departmentController as controller } from '#r/controllers';
import areaRouter from './area';

const router = express.Router({ mergeParams: true });

router.use('/:departmentId/areas', controller.validateExistance, areaRouter);

router.get('/:id', controller.validateRequest, controller.get);
router.get('/', controller.validateRequest, controller.queryGet);
router.post('/', controller.create);

export default router;
