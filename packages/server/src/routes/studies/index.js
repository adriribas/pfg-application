import express from 'express';

import { studyController as controller } from '#r/controllers';
import { Study as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';

const { get, filter, create } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:abv', validateRequest, get);
router.post('/filter', validateRequest, validateFilter, filter);
router.post('/', create);

export default router;
