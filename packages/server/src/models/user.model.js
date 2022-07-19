import { DataTypes, QueryError } from 'sequelize';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import config from 'config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';

import { db as sequelize } from '../startup';

const User = sequelize.define(
  'User',
  {
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
      allowNull: false,
      set(value) {
        this.setDataValue('secret', bcrypt.hashSync(value, 12));
      }
    },
    role: {
      type: DataTypes.ENUM(...config.get('userRoles').map(({ role }) => role)),
      allowNull: false
    },
    activated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  { paranoid: true }
);

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
  requirementCount: 3
};

User.validate = userData => validationSchema.validateAsync(userData);
User.validateAuth = authData => authValidationSchema.validateAsync(authData);
User.validateSecret = (secret = '') => passwordComplexity(passwordComplexityOptions).validateAsync(secret);

const generateJsonWebToken = (user, type) =>
  jwt.sign(_.pick(user, config.get(`jwt.${type}.fields`)), config.get(`jwt.${type}.key`), {
    expiresIn: config.get(`jwt.${type}.expiration`)
  });

User.prototype.generateAuthJwt = function () {
  return generateJsonWebToken(this, 'auth');
};
User.prototype.generateResetPasswordJwt = function () {
  return generateJsonWebToken(this, 'resetPassword');
};

export default User;
