import express from 'express';

import { studyController as controller } from '#r/controllers';

const router = express.Router({ mergeParams: true });

router.get('/:id', controller.validateRequest, controller.get);
router.get('/', controller.validateRequest, controller.queryGet);
router.post('/', controller.create);

export default router;
