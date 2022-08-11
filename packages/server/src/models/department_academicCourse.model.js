import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const DepartmentAcademicCourse = sequelize.define(
  'DepartmentAcademicCourse',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['department', 'academicCourse'], unique: true }] }
);

DepartmentAcademicCourse.associate = ({ Department, AcademicCourse }) => {
  DepartmentAcademicCourse.belongsTo(Department, { foreignKey: 'department' });
  DepartmentAcademicCourse.belongsTo(AcademicCourse, { foreignKey: 'academicCourse' });
};

const validationSchema = Joi.object({});
DepartmentAcademicCourse.validate = data => validationSchema.validate(data);

export default DepartmentAcademicCourse;
