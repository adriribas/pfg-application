import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { db as sequelize } from '#r/startup';
import { reqProcessing, usersUtil, groupsUtil } from '#r/utils';
import {
  Study as Model,
  School as SchoolModel,
  User as UserModel,
  Department as DepartmentModel,
  Area as AreaModel,
  Subject as SubjectModel,
  LabType as LabTypeModel
} from '#r/models';

const { buildWhere, createOrUpdate, isValidUpdateData, updateFields, updateRelation, resError } =
  reqProcessing;
const { hasPermissions } = usersUtil;
const { syncSubjectGroups } = groupsUtil;
const debug = createDebugger('pfgs:studyController');

export const get = async (req, res) => {
  const {
    scopes: { school: schoolScope },
    params: { abv },
    query: { fields }
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Study key not provided.');
  }

  const study = await schoolScope(Model).findByPk(abv, { attributes: fields });
  if (!study) {
    return resError(res, 404);
  }

  res.json(study);
};

export const filter = async (req, res) => {
  const {
    scopes: { school: schoolScope },
    query: { fields },
    body: { data: filterData }
  } = req;

  res.json(
    await schoolScope(Model).findAll({
      where: buildWhere(filterData),
      attributes: fields
    })
  );
};

export const create = async (req, res) => {
  const {
    user: { school: schoolAbv }
  } = req;
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

      const departmentInstances = [];

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
            if (!departmentInstances.find(({ abv }) => abv === department.abv)) {
              departmentInstances.push(department);
            }

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

      await school.addDepartments(
        await Promise.all(
          departmentInstances.filter(
            async department => !(await school.hasDepartment(department, { transaction }))
          )
        ),
        { transaction }
      );

      return study;
    });

    res.status(201).json(study);
  } catch (e) {
    debug('Error during study creation transaction', e);
    resError(res, 400, 'INVALID_DATA', e.message);
  }
};

export const update = async (req, res) => {
  const {
    user: currentUserData,
    scopes: { school: schoolScope },
    params: { abv },
    body: data
  } = req;
  if (!abv) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Study key not provided.');
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', 'The data to update is not valid.');
  }

  const study = await schoolScope(Model).findByPk(abv);
  if (!study) {
    return resError(res, 404);
  }

  const { coordinador: userId, ...attributes } = data;
  await updateFields(study, attributes);
  if (userId) {
    const user = await schoolScope(UserModel).findByPk(userId);

    if (!user) {
      return resError(res, 400, 'DATA_NOT_FOUND', 'Coordinador user not found.');
    }

    if (!hasPermissions(currentUserData.role, user.role)) {
      resError(res, 403, 'NO_PERMISSIONS', 'Current user cannot assign the other user.');
    }

    await study.setUser(user);
  } else {
    await study.setUser(null);
  }

  res.json(study);
};
