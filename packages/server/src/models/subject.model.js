import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const Subject = sequelize.define(
  'Subject',
  {
    code: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    credits: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    bigGroups: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    mediumGroups: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    littleGroups: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    }
  },
  { paranoid: true, indexes: [{ fields: ['semester'] }] }
);

Subject.associate = ({ Area, AreaSubject, Study, StudySubject, LabType, SubjectLabType, Group }) => {
  Subject.belongsToMany(Area, { through: AreaSubject, foreignKey: 'subject', otherKey: 'area' });
  Subject.hasMany(AreaSubject, { foreignKey: 'subject' });

  Subject.belongsToMany(Study, { through: StudySubject, foreignKey: 'subject', otherKey: 'study' });
  Subject.hasMany(StudySubject, { foreignKey: 'subject' });

  Subject.belongsToMany(LabType, { through: SubjectLabType, foreignKey: 'subject', otherKey: 'labType' });
  Subject.hasMany(SubjectLabType, { foreignKey: 'subject' });

  Subject.hasMany(Group, { foreignKey: 'subject' });
};

Subject.requiredFilterFields = ['study'];

const validationSchema = Joi.object({
  code: Joi.string().alphanum().max(10).required(),
  name: Joi.string().max(100).required(),
  semester: Joi.number().min(1).max(2).required(),
  credits: Joi.number().min(0).max(60).required(),
  bigGroups: Joi.number().min(0).max(20),
  mediumGroups: Joi.number().min(0).max(20),
  littleGroups: Joi.number().min(0).max(20)
});
Subject.validate = data => validationSchema.validate(data);

export default Subject;
