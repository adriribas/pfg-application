import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const Department = sequelize.define(
  'Department',
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

Department.associate = ({ AcademicCourse, Area }) => {
  Department.belongsTo(AcademicCourse);
  Department.hasMany(Area);
};

const validationSchema = Joi.object({});
Department.validate = departmentData => validationSchema.validate(departmentData);

export default Department;
