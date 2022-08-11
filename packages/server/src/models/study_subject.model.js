import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const StudySubject = sequelize.define(
  'StudySubject',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    course: {
      type: DataTypes.TINYINT,
      allowNull: false
    }
  },
  { timestamps: false, indexes: [{ fields: ['study', 'subject'], unique: true }] }
);

StudySubject.associate = ({ Study, Subject }) => {
  StudySubject.belongsTo(Study, { foreignKey: 'study' });
  StudySubject.belongsTo(Subject, { foreignKey: 'subject' });
};

const validationSchema = Joi.object({});
StudySubject.validate = data => validationSchema.validate(data);

export default StudySubject;
