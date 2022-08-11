import express from 'express';

import { academicCourseController as controller } from '#r/controllers';
import { AcademicCourse as Model } from '#r/models';
import { reqProcessing } from '#r/middlewares';
//import departmentRouter from './department';
//import studyRouter from './study';
//import subjectRouter from './subject';

const { get, filter, create, update } = controller;
const validateRequest = reqProcessing.requestValidator(Model);
const validateFilter = reqProcessing.filterValidator(Model);

const router = express.Router({ mergeParams: true });

//router.use('/:academicCourseId/departments', controller.validateExistance, departmentRouter);
//router.use('/:academicCourseId/studies', controller.validateExistance, studyRouter);
//router.use('/:academicCourseId/subjects', controller.validateExistance, subjectRouter);

router.get('/:startYear', validateRequest, get);
router.post('/filter', validateFilter, filter);
router.post('/', create);
router.patch('/:startYear', update);

export default router;
