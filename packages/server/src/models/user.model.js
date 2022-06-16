import { DataTypes, QueryError } from 'sequelize';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import config from 'config';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { sequelize } from '../db';

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM(...config.get('userRoles')),
        allowNull: false
    },
    activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { paranoid: true });

const validationSchema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    secret: Joi.string().required(),
    role: Joi.string().min(3).max(255).required(),
    activated: Joi.bool()
});

const authValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    secret: Joi.string().required()
});

const passwordComplexityOptions = {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3
};

const jwtPayloadData = ['id', 'firstName', 'lastName', 'email', 'role', 'activated'];

User.validate = userData => validationSchema.validateAsync(userData);
User.validateAuth = authData => authValidationSchema.validateAsync(authData);
User.validateSecret = secret => passwordComplexity(passwordComplexityOptions).validateAsync(secret);

User.prototype.generateJsonWebToken = function() {
    return jwt.sign(_.pick(this, jwtPayloadData), config.get('jwtPrivateKey'));
}

export default User;
