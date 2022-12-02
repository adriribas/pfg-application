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
  {
    indexes: [{ fields: ['id', 'type', 'number'], unique: true }],
    hooks: {
      afterCreate: async (group, { transaction }) => {
        if (await group.countTimeBlocks({ transaction })) {
          return;
        }

        await group.createTimeBlock(
          { ...config.get(`defaultData.timeBlock.${group.type}`) },
          { transaction }
        );
      }
    }
  }
);

Group.associate = ({ Subject, TimeBlock, Study, StudyGroup }) => {
  Group.belongsTo(Subject, { foreignKey: 'subject' });

  Group.hasMany(TimeBlock, { foreignKey: 'group' });

  Group.belongsToMany(Study, {
    through: StudyGroup,
    foreignKey: 'group',
    otherKey: 'study'
  });
  Group.hasMany(StudyGroup, { foreignKey: 'group' });
};

Group.updatableFields = ['studies'];

const validationSchema = Joi.object({
  type: Joi.string().min(2).max(20).required(),
  number: Joi.number().min(1).max(50).required()
});
Group.validate = data => validationSchema.validate(data);

export default Group;
