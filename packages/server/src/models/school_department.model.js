import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const SchoolDepartment = sequelize.define(
  'SchoolDepartment',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['department', 'school'], unique: true }] }
);

SchoolDepartment.associate = ({ Department, School }) => {
  SchoolDepartment.belongsTo(School, { foreignKey: 'school' });
  SchoolDepartment.belongsTo(Department, { foreignKey: 'department' });
};

const validationSchema = Joi.object({});
SchoolDepartment.validate = data => validationSchema.validate(data);

export default SchoolDepartment;
