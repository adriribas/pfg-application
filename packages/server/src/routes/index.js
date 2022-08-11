import express from 'express';

import authRouter from './auth';
import usersRouter from './users';
import studiesRouter from './studies';
import subjectsRouter from './subjects';
import deparmentsRouter from './departments';
import areasRouter from './areas';
import academicCoursesRouter from './academicCourses';
import { authorization } from '#r/middlewares';

const { auth } = authorization;

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', auth, usersRouter);
router.use('/studies', auth, studiesRouter);
router.use('/subjects', auth, subjectsRouter);
router.use('/academic-courses', auth, academicCoursesRouter);
router.use('/departments', auth, deparmentsRouter);
router.use('/areas', auth, areasRouter);

export default router;
