import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const SubjectLabType = sequelize.define(
  'SubjectLabType',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['subject', 'labType'], unique: true }] }
);

SubjectLabType.associate = ({ Subject, LabType }) => {
  SubjectLabType.belongsTo(Subject, { foreignKey: 'subject' });
  SubjectLabType.belongsTo(LabType, { foreignKey: 'labType' });
};

const validationSchema = Joi.object({});
SubjectLabType.validate = data => validationSchema.validate(data);

export default SubjectLabType;
