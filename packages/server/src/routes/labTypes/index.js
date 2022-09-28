import express from 'express';

import { labTypeController as controller } from '#r/controllers';
import { LabType as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';

const { get, filter, update } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:name', validateRequest, get);
router.post('/filter', validateRequest, validateFilter, filter);
router.patch('/:name', validateRequest, update);

export default router;
