import express from 'express';

import { departmentController as controller } from '#r/controllers';
import { Department as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';

const { get, filter, update } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:abv', validateRequest, get);
router.post('/filter', validateRequest, validateFilter, filter);
router.patch('/:abv', update);

export default router;
