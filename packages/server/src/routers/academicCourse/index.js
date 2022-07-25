import express from 'express';

import { academicCourseController as controller } from '../../controllers';
import departmentRouter from './department';
import studyRouter from './study';
import subjectRouter from './subject';

const router = express.Router();

router.use('/:academicCourseId/departments', controller.validateExistance, departmentRouter);
router.use('/:academicCourseId/studies', controller.validateExistance, studyRouter);
router.use('/:academicCourseId/subjects', controller.validateExistance, subjectRouter);

router.get('/:id', controller.validateRequest, controller.get);
router.get('/', controller.validateRequest, controller.queryGet);
router.post('/', controller.create);

export default router;
