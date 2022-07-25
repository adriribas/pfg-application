import express from 'express';

import { subjectController as controller } from '../../../controllers';

const router = express.Router({ mergeParams: true });

export default router;
