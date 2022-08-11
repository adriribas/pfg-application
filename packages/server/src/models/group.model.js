import { DataTypes } from 'sequelize';
import Joi from 'joi';
import config from 'config';

import { db as sequelize } from '#r/startup';

const Group = sequelize.define(
  'Group',
  {
    type: {
      type: DataTypes.ENUM(...config.get('groupTypes')),
      allowNull: false
    },
    number: {
      type: DataTypes.TINYINT,
      allowNull: false
    }
  },
  { indexes: [{ fields: ['id', 'type', 'number'], unique: true }] }
);

Group.associate = ({ Subject, AcademicCourse }) => {
  Group.belongsTo(Subject, { foreignKey: 'subject' });
  Group.belongsTo(AcademicCourse, { foreignKey: 'academicCourse' });
};

const validationSchema = Joi.object({
  type: Joi.string().min(2).max(20).required(),
  number: Joi.number().min(1).max(50).required()
});
Group.validate = data => validationSchema.validate(data);

export default Group;
