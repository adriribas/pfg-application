import express from 'express';

import authRouter from './auth';
import userRouter from './user';
import academicCourseRouter from './academicCourse';
import * as middlewares from '../middlewares';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', middlewares.auth, userRouter);
router.use('/academic-courses', middlewares.auth, academicCourseRouter);

export default router;
