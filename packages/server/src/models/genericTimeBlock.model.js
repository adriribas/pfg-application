import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';
import { stringsUtil } from '#r/utils';

const { abreviate } = stringsUtil;

const GenericTimeBlock = sequelize.define(
  'GenericTimeBlock',
  {
    course: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    labelAbv: {
      type: DataTypes.VIRTUAL,
      get() {
        return abreviate(this.getDataValue('label').split(' '));
      }
    },
    subLabel: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
  },
  {
    scopes: {
      study(studyAbv) {
        return { where: { study: studyAbv } };
      }
    }
  }
);

GenericTimeBlock.associate = ({ Study }) => {
  GenericTimeBlock.belongsTo(Study, { foreignKey: 'study' });
};

GenericTimeBlock.updatableFields = ['label', 'subLabel', 'day', 'start', 'duration', 'week'];

const validationSchema = Joi.object({
  study: Joi.string().required(),
  course: Joi.number().min(1).max(8),
  semester: Joi.number().min(1).max(2).required(),
  label: Joi.string().required(),
  subLabel: Joi.string().required(),
  day: Joi.number().min(0).max(4).allow(null),
  start: Joi.string()
    .pattern(/[0-2][0-9]:[0-5][0-9]:00/)
    .allow(null),
  duration: Joi.number().min(15).max(800),
  week: Joi.string().pattern(/A|B/).allow(null)
});

GenericTimeBlock.validate = data => validationSchema.validateAsync(data);

export default GenericTimeBlock;
