import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const Subject = sequelize.define(
  'Subject',
  {
    code: {
      type: DataTypes.STRING(10),
      unique: true
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
    },
    course: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    isMandatory: DataTypes.BOOLEAN,
    credits: DataTypes.TINYINT,
    plannedStudents: DataTypes.INTEGER
  },
  { paranoid: true, indexes: [{ fields: ['course', 'semester'] }] }
);

Subject.associate = ({ Area, Study }) => {
  Subject.belongsTo(Area);
  Subject.belongsToMany(Study, { through: 'StudiesSubjects' });
};

const validationSchema = Joi.object({});
Subject.validate = subjectData => validationSchema.validate(subjectData);

export default Subject;
