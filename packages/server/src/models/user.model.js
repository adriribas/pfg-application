import { DataTypes } from 'sequelize';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import config from 'config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';

import { db as sequelize } from '#r/startup';

const User = sequelize.define(
  'User',
  {
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(40),
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

User.associate = ({ School, Department, Area, Study }) => {
  User.belongsTo(School, { foreignKey: 'school' });
  User.hasOne(Department, { foreignKey: 'director' }); // Director departament
  User.hasOne(Area, { foreignKey: 'responsable' }); // Responsable de docència
  User.belongsTo(Area, { foreignKey: 'area' }); // Professor
  User.hasOne(Study, { foreignKey: 'coordinador' }); // Coordinador
};

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

User.validate = data => validationSchema.validateAsync(data);
User.validateAuth = authData => authValidationSchema.validateAsync(authData);
User.validateSecret = (secret = '') => passwordComplexity(passwordComplexityOptions).validateAsync(secret);
User.verifyAuthToken = bearerToken => {
  const [type, token] = bearerToken.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new Error('Invalid token type');
  }
  return jwt.verify(token, config.get('jwt.auth.key'));
};

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
