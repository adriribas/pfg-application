import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const StudyAcademicCourse = sequelize.define(
  'StudyAcademicCourse',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['study', 'academicCourse'], unique: true }] }
);

StudyAcademicCourse.associate = ({ Study, AcademicCourse }) => {
  StudyAcademicCourse.belongsTo(Study, { foreignKey: 'study' });
  StudyAcademicCourse.belongsTo(AcademicCourse, { foreignKey: 'academicCourse' });
};

const validationSchema = Joi.object({});
StudyAcademicCourse.validate = data => validationSchema.validate(data);

export default StudyAcademicCourse;
