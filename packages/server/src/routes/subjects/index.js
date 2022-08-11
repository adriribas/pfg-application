import express from 'express';

import { subjectController as controller } from '#r/controllers';
import { Subject as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';

const { get, filter } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:code', validateRequest, get);
router.post('/filter', validateRequest, validateFilter, filter);

export default router;
