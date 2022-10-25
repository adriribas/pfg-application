import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const StudyGroup = sequelize.define(
  'StudyGroup',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['study', 'group'], unique: true }] }
);

StudyGroup.associate = ({ Study, Group }) => {
  StudyGroup.belongsTo(Study, { foreignKey: 'study' });
  StudyGroup.belongsTo(Group, { foreignKey: 'group' });
};

const validationSchema = Joi.object({});
StudyGroup.validate = data => validationSchema.validate(data);

export default StudyGroup;
