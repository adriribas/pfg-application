import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { db as sequelize } from '#r/startup';
import { reqProcessing, groupsUtil } from '#r/utils';
import {
  Study as Model,
  School as SchoolModel,
  Department as DepartmentModel,
  Area as AreaModel,
  Subject as SubjectModel,
  LabType as LabTypeModel
} from '#r/models';

const { buildWhere, createOrUpdate, resError } = reqProcessing;
const { syncSubjectGroups } = groupsUtil;
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
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      attributes: fields
    })
  );
};

export const create = async (req, res) => {
  const schoolAbv = req.user.school;
  if (!schoolAbv) {
    return resError(res, 400, 'INVALID_USER', 'User is not assigned to any school.');
  }

  const school = await SchoolModel.findByPk(schoolAbv);
  if (!school) {
    return resError(res, 400, 'INVALID_DATA', `School ${schoolAbv} does not exist.`);
  }

  try {
    const study = await sequelize.transaction(async transaction => {
      const data = _.pick(req.body, ['abv']);
      const [study] = await createOrUpdate(Model, { abv: data.abv }, data, transaction);

      await study.setSchool(school, { transaction });

      for (const rawSubjectData of req.body.subjects) {
        const subjectData = _.pick(rawSubjectData, [
          'code',
          'name',
          'semester',
          'credits',
          'bigGroups',
          'mediumGroups',
          'smallGroups'
        ]);
        debug('Attempting to create subject', subjectData);
        const [subject] = await createOrUpdate(
          SubjectModel,
          { code: subjectData.code },
          subjectData,
          transaction
        );

        await syncSubjectGroups(subject, transaction);

        const { areas, labTypes } = rawSubjectData;
        if (areas instanceof Array) {
          const areaInstances = [];
          for (const { department: departmentData, ...areaData } of areas) {
            const [department] = await createOrUpdate(
              DepartmentModel,
              { abv: departmentData.abv },
              departmentData,
              transaction
            );
            const [area] = await createOrUpdate(AreaModel, { abv: areaData.abv }, areaData, transaction);
            await area.setDepartment(department, { transaction });
            if (!areaInstances.find(({ abv }) => abv === area.abv)) {
              areaInstances.push(area);
            }
          }
          await subject.setAreas(areaInstances, { transaction });
        }
        if (labTypes instanceof Array) {
          const labTypeInstances = [];
          for (const labTypeData of labTypes) {
            const [labType] = await createOrUpdate(
              LabTypeModel,
              { name: labTypeData.name },
              labTypeData,
              transaction
            );
            if (!labTypeInstances.find(({ name }) => name === labType.name)) {
              labTypeInstances.push(labType);
            }
          }
          await subject.setLabTypes(labTypeInstances, { transaction });
        }

        await study.addSubject(subject, { through: { course: rawSubjectData.course }, transaction });
      }

      return study;
    });

    res.status(201).json(study);
  } catch (e) {
    debug('Error during study creation transaction', e);
    resError(res, 400, 'INVALID_DATA', e.message);
  }
};
