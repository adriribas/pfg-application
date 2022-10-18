import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const LabType = sequelize.define(
  'LabType',
  {
    name: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    amount: {
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      set(value) {
        this.setDataValue('amount', value || 0);
      }
    },
    capacity: {
      type: DataTypes.SMALLINT,
      set(value) {
        this.setDataValue('capacity', value || 0);
      }
    }
  },
  { paranoid: true }
);

LabType.associate = ({ Subject, SubjectLabType }) => {
  LabType.belongsToMany(Subject, { through: SubjectLabType, foreignKey: 'labType', otherKey: 'subject' });
  LabType.hasMany(SubjectLabType, { foreignKey: 'labType' });
};

LabType.updatableFields = ['amount', 'capacity'];

const validationSchema = Joi.object({
  name: Joi.string().alphanum().min(1).max(50).required(),
  capacity: Joi.number().min(0)
});
LabType.validate = data => validationSchema.validate(data);

export default LabType;
