import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';
import { hardDataUtil } from '#r/utils';

const Department = sequelize.define(
  'Department',
  {
    abv: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      set(abv) {
        this.setDataValue('name', hardDataUtil.getValue('departments', abv) || abv);
      }
    }
  },
  { paranoid: true }
);

Department.associate = ({ User, AcademicCourse, DepartmentAcademicCourse, Area }) => {
  Department.belongsTo(User, { foreignKey: 'director' });

  Department.belongsToMany(AcademicCourse, {
    through: DepartmentAcademicCourse,
    foreignKey: 'department',
    otherKey: 'academicCourse'
  });
  Department.hasMany(DepartmentAcademicCourse, { foreignKey: 'department' });

  Department.hasMany(Area, { foreignKey: 'department' });
};

const validationSchema = Joi.object({
  abv: Joi.string().min(2).max(8).required()
});
Department.validate = data => validationSchema.validate(data);

export default Department;
