import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const TimeBlock = sequelize.define('TimeBlock', {
  day: {
    type: DataTypes.TINYINT,
    defaultValue: null
  },
  start: {
    type: DataTypes.TIME,
    get() {
      return this.getDataValue('start')?.substring(0, 5) || null;
    }
  },
  duration: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  week: {
    type: DataTypes.ENUM('A', 'B'),
    defaultValue: null
  }
});

TimeBlock.associate = ({ Group }) => {
  TimeBlock.belongsTo(Group, { foreignKey: 'group' });
};

TimeBlock.updatableFields = ['day', 'start', 'duration', 'week'];

const validationSchema = Joi.object({
  group: Joi.number().min(1).required(),
  day: Joi.number().min(0).max(4).allow(null),
  start: Joi.string()
    .pattern(/[0-2][0-9]:[0-5][0-9]:00/)
    .allow(null),
  duration: Joi.number().min(15).max(720),
  week: Joi.string().pattern(/A|B/).allow(null)
});

TimeBlock.validate = data => validationSchema.validateAsync(data);

export default TimeBlock;
