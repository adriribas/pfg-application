import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from 'config';
import createDebugger from 'debug';
import jwt from 'jsonwebtoken';

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
    const { error } = Model.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    const user = _.pick( req.body, ['firstName', 'lastName', 'email', 'secret', 'role', 'activated']);

    const { error: errorSecret } = Model.validateSecret(user.secret);
    if (errorSecret) {
        return res.status(400).send(errorSecret.details.map(({ message }) => message).join(' - '));
    }
    user.secret = await bcrypt.hash(user.secret, await bcrypt.genSalt(12));
    
    await Model.create(user);

    //const token = jwt.sign(_.pick(user, ['id', 'firstName', 'lastName', 'email', 'role']), config.get('jwtPrivateKey'));
    res/*.header('X-auth-token', token)*/.send(user);
};

export const update = async (req, res) => {
    const { error } = Model.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
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
