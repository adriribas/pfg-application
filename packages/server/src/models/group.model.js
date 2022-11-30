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

        /* // Data for test reasons:
        const rand = max => Math.floor(Math.random() * (max + 1));

        const h1 = rand(1);
        const h2 = h1 === 0 ? [8, 9][rand(1)] : rand(9);

        const testData = {
          day: rand(4),
          start: `${h1}${h2}:${['0', '3'][rand(1)]}0`,
          duration: [30, 60, 90, 120, 150][rand(4)],
          week: [null, 'A', 'B'][rand(2)]
        }; */

        await group.createTimeBlock(
          /* rand(2) === 2
            ? { duration: testData.duration }
            : testData  */
          config.get(`defaultData.timeBlock.${group.type}`),
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
