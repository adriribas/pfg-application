import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '../startup';

const Study = sequelize.define(
  'Study',
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

Study.associate = ({ AcademicCourse, Subject }) => {
  Study.belongsTo(AcademicCourse);
  Study.belongsToMany(Subject, { through: 'StudiesSubjects' });
};

const validationSchema = Joi.object({});
Study.validate = studyData => validationSchema.validate(studyData);

export default Study;
