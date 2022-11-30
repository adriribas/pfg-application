import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const TimeBlock = sequelize.define('TimeBlock', {
  day: DataTypes.TINYINT,
  start: {
    type: DataTypes.TIME,
    get() {
      return this.getDataValue('start')?.substring(0, 5) || null;
    }
  },
  duration: DataTypes.SMALLINT,
  week: DataTypes.ENUM('A', 'B')
});

TimeBlock.associate = ({ Group }) => {
  TimeBlock.belongsTo(Group, { foreignKey: 'group' });
};

TimeBlock.updatableFields = ['day', 'start', 'duration', 'week'];

const validationSchema = Joi.object({
  day: Joi.number().min(0).max(4),
  start: Joi.string().pattern(/[0-2][0-9]:[0-5][0-9]:00/),
  duration: Joi.number().min(15).max(800),
  week: Joi.string().pattern(/A|B/)
});

TimeBlock.validate = data => validationSchema.validateAsync(data);

export default TimeBlock;
