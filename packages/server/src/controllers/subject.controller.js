import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing, groupsUtil } from '#r/utils';
import {
  Subject as Model,
  Study as StudyModel,
  Department as DepartmentModel,
  Area as AreaModel,
  LabType as LabTypeModel,
  TimeBlock as TimeBlockModel
} from '#r/models';

const { buildWhere, updateFields, updateRelation, isValidUpdateData, resError } = reqProcessing;
const { syncSubjectGroups } = groupsUtil;
const debug = createDebugger('pfgs:subjectController');

const buildInclude = ({ Area, LabType, Study, Group }) => {
  const include = [];

  Area &&
    include.push({
      model: Area,
      through: { attributes: [] },
      attributes: ['abv', 'name'],
      include: {
        model: DepartmentModel,
        attributes: ['abv', 'name']
      }
    });
  LabType &&
    include.push({
      model: LabType,
      through: { attributes: [] },
      attributes: ['name']
    });
  Study &&
    include.push({
      model: StudyModel,
      through: { attributes: ['course'] },
      attributes: ['abv', 'name']
    });
  Group &&
    include.push({
      model: Group,
      attributes: ['id', 'type', 'number'],
      include: [
        {
          model: TimeBlockModel,
          attributes: ['id', 'day', 'start', 'duration', 'week']
        },
        {
          model: StudyModel,
          through: { attributes: [] },
          attributes: ['abv', 'name']
        }
      ]
    });

  return include;
};

export const get = async (req, res) => {
  const {
    params: { code },
    query: { fields, include }
  } = req;
  if (!code) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'assignatura.");
  }

  const subject = await Model.findByPk(code, { include: buildInclude(include), attributes: fields });
  if (!subject) {
    return resError(res, 404);
  }

  res.json(subject);
};

export const filter = async (req, res) => {
  const {
    query: { fields, include },
    body: {
      data: filterData,
      associations: { study: studyAbv },
      specialOptions
    }
  } = req;
  const course = specialOptions?.course;

  if (studyAbv && include.Study) {
    delete include.study;
  }

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      include: [
        {
          model: StudyModel,
          where: buildWhere({ abv: studyAbv }),
          through: {
            where: course && buildWhere({ course }),
            attributes: ['course']
          },
          attributes: ['abv', 'name']
        },
        ...buildInclude(include)
      ],
      attributes: fields
    })
  );
};

export const update = async (req, res) => {
  const {
    params: { code },
    body: data
  } = req;
  if (!code) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', "No s'ha proporcionat l'identificador de l'assignatura.");
  }

  if (!isValidUpdateData(Model, data)) {
    return resError(res, 400, 'INVALID_DATA', "Les dades per actualitzar l'assignatura no són vàlides.");
  }

  const subject = await Model.findByPk(code);
  if (!subject) {
    return resError(res, 404);
  }

  const { areas, labTypes, ...attributes } = data;
  await updateFields(subject, attributes);
  await syncSubjectGroups(subject);
  await updateRelation(AreaModel, areas, subject, 'setAreas');
  await updateRelation(LabTypeModel, labTypes, subject, 'setLabTypes');

  res.json(
    await Model.findByPk(code, {
      include: buildInclude({ Area: areas && AreaModel, LabType: labTypes && LabTypeModel })
    })
  );
};
