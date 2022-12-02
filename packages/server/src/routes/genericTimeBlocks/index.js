import express from 'express';

import { genericTimeBlockController as controller } from '#r/controllers';
import { GenericTimeBlock as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';

const { get, filter, create, update, remove } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:id', validateRequest, get);
router.post('/filter', validateRequest, validateFilter, filter);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
