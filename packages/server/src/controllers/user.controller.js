import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import createDebugger from 'debug';

import { User as Model } from '../models';

const debug = createDebugger('pfgs:userController');

export const get = async (req, res) => {
  const user = await Model.findByPk(req.params.id);

  if (!user) {
    return res.status(404).send(`[ERROR]: User with id "${req.params.id}" does not exist`);
  }

  res.send(user);
};

export const getAll = async (_req, res) => {
  res.send(await Model.findAll());
};

export const create = async (req, res) => {
  try {
    await Model.validate(req.body);
    const user = _.pick(req.body, ['firstName', 'lastName', 'email', 'secret', 'role', 'activated']);
    await Model.validateSecret(user.secret);
  } catch (e) {
    return res.status(400).send(e.message);
  }

  user.secret = await bcrypt.hash(user.secret, await bcrypt.genSalt(12));

  await Model.create(user);

  res.send(user);
};

export const update = async (req, res) => {
  try {
    await Model.validate(req.body);
  } catch (e) {
    return res.status(400).send(e.message);
  }

  const updatedRows = await Model.update(req.body, {
    where: { id: req.params.id }
  });
  if (!updatedRows) {
    return res.status(404).send(`[ERROR]: User with id "${req.params.id}" does not exist`);
  }
};

export const destroy = async (req, res) => {
  const deletedRows = Model.destroy({
    where: { id: req.params.id }
  });
  if (!deletedRows) {
    return res.status(404).send(`[ERROR]: User with id "${req.params.id}" does not exist`);
  }

  res.send({ id: req.params.id });
};
