import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const AcademicCourse = sequelize.define(
  'AcademicCourse',
  {
    startYear: {
      type: DataTypes.SMALLINT,
      primaryKey: true
    },
    endYear: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.startYear + 1;
      },
      set() {
        throw new Error('End year cannot be set');
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  { paranoid: true }
);

AcademicCourse.associate = ({ Study, StudyAcademicCourse, Department, DepartmentAcademicCourse, Group }) => {
  AcademicCourse.belongsToMany(Study, {
    through: StudyAcademicCourse,
    foreignKey: 'academicCourse',
    otherKey: 'study'
  });
  AcademicCourse.hasMany(StudyAcademicCourse, { foreignKey: 'academicCourse' });

  AcademicCourse.belongsToMany(Department, {
    through: DepartmentAcademicCourse,
    foreignKey: 'academicCourse',
    otherKey: 'department'
  });
  AcademicCourse.hasMany(DepartmentAcademicCourse, { foreignKey: 'academicCourse' });

  AcademicCourse.hasMany(Group, { foreignKey: 'academicCourse' });
};

const validationSchema = Joi.object({
  startYear: Joi.number().min(2022).max(3022)
});
AcademicCourse.validate = data => validationSchema.validate(data);

export default AcademicCourse;
