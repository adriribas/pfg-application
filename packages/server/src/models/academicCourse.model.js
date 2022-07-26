import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const AcademicCourse = sequelize.define(
  'AcademicCourse',
  {
    startYear: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      unique: true
    },
    endYear: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.startYear + 1;
      },
      set() {
        this.setDataValue('endYear', this.startYear + 1);
      }
    }
  },
  { paranoid: true }
);

AcademicCourse.associate = ({ User, Study, Department }) => {
  AcademicCourse.belongsToMany(User, { through: 'UserAcademicCourse' });
  AcademicCourse.hasMany(Study);
  AcademicCourse.hasMany(Department);
};

const validationSchema = Joi.object({});
AcademicCourse.validate = academicCourseData => validationSchema.validate(academicCourseData);

export default AcademicCourse;
