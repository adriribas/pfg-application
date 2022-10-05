import express from 'express';

import { userController as controller } from '#r/controllers';
import { User as Model } from '#r/models';
import { reqProcessing, userProcessing } from '#r/middlewares';

const { get, filter, create, update, destroy } = controller;
//const { applyFieldRestrictions } = userProcessing;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

router.get('/:id', validateRequest, /* applyFieldRestrictions, */ get);
router.post('/filter', validateRequest, /* applyFieldRestrictions, */ validateFilter, filter);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', destroy);

export default router;
