import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const TimeBlock = sequelize.define('TimeBlock', {
  day: DataTypes.TINYINT,
  start: DataTypes.TIME,
  end: DataTypes.TIME,
  week: DataTypes.ENUM('A', 'B')
});

TimeBlock.associate = ({ Group }) => {
  TimeBlock.belongsTo(Group, { foreignKey: 'group' });
};

TimeBlock.updatableFields = ['day', 'start', 'end', 'week'];

const validationSchema = Joi.object({
  day: Joi.number().min(0).max(4),
  start: Joi.string().pattern(/[0-2][0-9]:[0-5][0-9]:00/),
  end: Joi.string().pattern(/[0-2][0-9]:[0-5][0-9]:00/),
  week: Joi.string().pattern(/A|B/)
});

TimeBlock.validate = data => validationSchema.validateAsync(data);

export default TimeBlock;
