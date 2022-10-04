import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';
import { hardDataUtil } from '#r/utils';

const Study = sequelize.define(
  'Study',
  {
    abv: {
      type: DataTypes.STRING(8),
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return hardDataUtil.getValue('studies', this.abv) || null;
      }
    }
  },
  { paranoid: true }
);

Study.associate = ({ User, School, Subject, StudySubject }) => {
  Study.belongsTo(User, { foreignKey: 'coordinador' });

  Study.belongsTo(School, { foreignKey: 'school' });

  Study.belongsToMany(Subject, {
    through: StudySubject,
    foreignKey: 'study',
    otherKey: 'subject'
  });
  Study.hasMany(StudySubject, { foreignKey: 'study' });
};

Study.requiredFilterFields = ['school'];
Study.updatableFields = ['coordinador'];

const validationSchema = Joi.object({
  abv: Joi.string().min(2).max(8).required()
});
Study.validate = data => validationSchema.validate(data);

export default Study;
