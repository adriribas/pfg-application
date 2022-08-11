import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { db as sequelize } from '#r/startup';
import { reqProcessing } from '#r/utils';
import {
  Study as Model,
  AcademicCourse as AcademicCourseModel,
  Department as DepartmentModel,
  Area as AreaModel,
  Subject as SubjectModel,
  LabType as LabTypeModel,
  Group as GroupModel
} from '#r/models';

const { buildWhere, findOrCreate, resError } = reqProcessing;
const debug = createDebugger('pfgs:studyController');

export const get = async (req, res) => {
  const { abv } = req.params;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Study key not provided.');
  }

  const study = await Model.findByPk(abv, { attributes: req.query.fields });
  if (!study) {
    return resError(res, 404);
  }

  res.json(study);
};

export const filter = async (req, res) => {
  const {
    data: filterData,
    associations: { academicCourse }
  } = req.body;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      include: {
        model: AcademicCourseModel,
        where: { startYear: academicCourse },
        through: { attributes: [] },
        attributes: []
      },
      attributes: req.query.fields
    })
  );
};

const createGroup = async (subject, academicCourse, groupData, transaction) => {
  await GroupModel.validate(groupData);
  const group = await GroupModel.create(groupData, { transaction });
  await subject.addGroup(group, { transaction });
  return academicCourse.addGroup(group, { transaction });
};

const createGroups = (subject, academicCourse, type, amount, transaction) => {
  const creationPromises = [];

  for (let i = 1; i <= amount; i++) {
    const groupData = { type, number: i };
    creationPromises.push(createGroup(subject, academicCourse, groupData, transaction));
  }

  return Promise.all(creationPromises);
};

export const create = async (req, res) => {
  const academicCourseStartYear = req.body.academicCourse;
  if (!academicCourseStartYear) {
    return resError(res, 400, 'INVALID_DATA', 'Academic course not provided.');
  }
  const academicCourse = await AcademicCourseModel.findByPk(academicCourseStartYear);
  if (!academicCourse) {
    return resError(res, 400, 'INVALID_DATA', `Academic course ${academicCourseStartYear} does not exist.`);
  }
  try {
    const study = await sequelize.transaction(async transaction => {
      const data = { ..._.pick(req.body, ['abv']), name: req.body.abv };
      const [study] = await findOrCreate(Model, { abv: data.abv }, data, transaction);

      await academicCourse.addStudy(study, { transaction });

      for (const subjectWholeData of req.body?.subjects) {
        const departamentData = { abv: subjectWholeData.department };
        const [department] = await findOrCreate(
          DepartmentModel,
          { abv: departamentData.abv },
          departamentData,
          transaction
        );

        const areaData = { abv: subjectWholeData.area };
        const [area] = await findOrCreate(AreaModel, { abv: areaData.abv }, areaData, transaction);

        const subjectData = _.pick(subjectWholeData, [
          'code',
          'name',
          'semester',
          'credits',
          'bigGroups',
          'mediumGroups',
          'littleGroups'
        ]);
        debug('Trying to create subject', subjectData);
        const [subject] = await findOrCreate(
          SubjectModel,
          { code: subjectData.code },
          subjectData,
          transaction
        );

        const labTypeData = {
          name: subjectWholeData.labType,
          capacity: subjectWholeData.labTypeCapacity || 0
        };
        if (labTypeData.name) {
          const [labType] = await findOrCreate(
            LabTypeModel,
            { name: labTypeData.name },
            labTypeData,
            transaction
          );
          await subject.addLabType(labType, { transaction });
        }

        await area.setDepartment(department, { transaction });
        await area.addSubject(subject, { transaction });
        await study.addSubject(subject, { transaction, through: { course: subjectWholeData.course } });

        await createGroups(subject, academicCourse, 'little', subjectWholeData.littleGroups, transaction);
        await createGroups(subject, academicCourse, 'medium', subjectWholeData.mediumGroups, transaction);
        await createGroups(subject, academicCourse, 'big', subjectWholeData.bigGroups, transaction);
      }

      return study;
    });

    res.status(201).json(study);
  } catch (e) {
    debug('Error during study creation transaction', e);
    resError(res, 400, 'INVALID_DATA', e.message);
  }
};
