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
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      }
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
    },
    secret: {
      type: DataTypes.STRING,
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
  {
    paranoid: true,
    scopes: {
      school(schoolAbv) {
        return { where: { school: schoolAbv } };
      }
    }
  }
);

User.associate = ({ School, Department, Area, Study }) => {
  User.belongsTo(School, { foreignKey: 'school' });

  User.hasOne(Department, { foreignKey: 'director' }); // Director departament

  User.hasOne(Area, { foreignKey: 'responsable' }); // Responsable de docència

  User.belongsTo(Area, { foreignKey: 'area' }); // Professor

  User.hasOne(Study, { foreignKey: 'coordinador' }); // Coordinador
};

User.restrictedFields = ['secret'];
User.restrictedFilterFields = ['school', 'secret'];

const validationSchema = Joi.object({
  firstName: Joi.string().min(3).max(255).required(),
  lastName: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  role: Joi.string().min(3).max(255).required()
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

const generateJsonWebToken = (user, type, extraFields = {}) =>
  jwt.sign(
    { ..._.pick(user, config.get(`jwt.${type}.fields`)), ...extraFields },
    config.get(`jwt.${type}.key`),
    {
      expiresIn: config.get(`jwt.${type}.expiration`)
    }
  );

const roleFields = {
  Administrador: async user => {},
  Coordinador: async user => {
    const study = await user.getStudy();
    if (study) {
      return { study: _.pick(study, ['abv', 'name']) };
    }
  },
  'Director de departament': async user => {
    const department = await user.getDepartment();
    if (department) {
      return { department: _.pick(department, ['abv', 'name']) };
    }
  },
  'Responsable de docencia': async user => {},
  Professor: async user => {}
};

User.prototype.generateAuthJwt = async function () {
  return generateJsonWebToken(this, 'auth', await roleFields[this.role](this));
};
User.prototype.generateResetPasswordJwt = function () {
  return generateJsonWebToken(this, 'resetPassword');
};
User.prototype.generateEmailConfirmationJwt = function () {
  return generateJsonWebToken(this, 'emailConfirmation');
};

export default User;
