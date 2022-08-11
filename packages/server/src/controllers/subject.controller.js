import { Op } from 'sequelize';
import _ from 'lodash';
import createDebugger from 'debug';

import { reqProcessing } from '#r/utils';
import { Subject as Model, Study as StudyModel } from '#r/models';

const { buildWhere, resError } = reqProcessing;
const debug = createDebugger('pfgs:subjectController');

export const get = async (req, res) => {
  const { code } = req.params;
  if (!code) {
    return resError(res, 400, 'KEY_NOT_PROVIDED', 'Subject key not provided.');
  }

  const subject = await Model.findByPk(code, { attributes: req.query.fields });
  if (!subject) {
    return resError(res, 404);
  }

  res.json(subject);
};

export const filter = async (req, res) => {
  const {
    data: filterData,
    associations: { study }
  } = req.body;

  res.json(
    await Model.findAll({
      where: buildWhere(filterData),
      include: {
        model: StudyModel,
        where: buildWhere({ abv: study }),
        through: { attributes: ['course'] },
        attributes: ['abv']
      },
      attributes: req.query.fields
    })
  );
};
