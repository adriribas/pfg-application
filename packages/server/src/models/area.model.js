import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '../startup';

const Area = sequelize.define(
  'Area',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    abv: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  },
  { paranoid: true }
);

Area.associate = ({ Department, Subject }) => {
  Area.belongsTo(Department);
  Area.hasMany(Subject);
};

const validationSchema = Joi.object({});
Area.validate = areaData => validationSchema.validate(areaData);

export default Area;
