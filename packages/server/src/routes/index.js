import express from 'express';

import authRouter from './auth';
import usersRouter from './users';
import studiesRouter from './studies';
import subjectsRouter from './subjects';
import deparmentsRouter from './departments';
import areasRouter from './areas';
import academicCoursesRouter from './academicCourses';
import schoolsRouter from './schools';
import labTypesRouter from './labTypes';
import groupRouter from './groups';
import timeBlocksRouter from './timeBlocks';
import genericTimeBlocksRouter from './genericTimeBlocks';
import { authorization, reqProcessing } from '#r/middlewares';

const { auth } = authorization;
const { generateScopes } = reqProcessing;

const router = express.Router();

router
  .use('/auth', authRouter)
  .use('/users', auth, generateScopes, usersRouter)
  .use('/studies', auth, generateScopes, studiesRouter)
  .use('/subjects', auth, generateScopes, subjectsRouter)
  .use('/academic-courses', auth, generateScopes, academicCoursesRouter)
  .use('/schools', auth, generateScopes, schoolsRouter)
  .use('/departments', auth, generateScopes, deparmentsRouter)
  .use('/areas', auth, generateScopes, areasRouter)
  .use('/lab-types', auth, generateScopes, labTypesRouter)
  .use('/groups', auth, generateScopes, groupRouter)
  .use('/time-blocks', auth, generateScopes, timeBlocksRouter)
  .use('/generic-time-blocks', auth, generateScopes, genericTimeBlocksRouter);

export default router;
