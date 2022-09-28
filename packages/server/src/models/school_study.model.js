import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const SchoolStudy = sequelize.define(
  'SchoolStudy',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false, indexes: [{ fields: ['study', 'school'], unique: true }] }
);

SchoolStudy.associate = ({ Study, School }) => {
  SchoolStudy.belongsTo(School, { foreignKey: 'school' });
  SchoolStudy.belongsTo(Study, { foreignKey: 'study' });
};

const validationSchema = Joi.object({});
SchoolStudy.validate = data => validationSchema.validate(data);

export default SchoolStudy;
