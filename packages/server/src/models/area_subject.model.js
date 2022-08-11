import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const AreaSubject = sequelize.define(
  'AreaSubject',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  { timestamps: false }
);

AreaSubject.associate = ({ Area, Subject }) => {
  AreaSubject.belongsTo(Area, { foreignKey: 'area' });
  AreaSubject.belongsTo(Subject, { foreignKey: 'subject' });
};

const validationSchema = Joi.object({});
AreaSubject.validate = data => validationSchema.validate(data);

export default AreaSubject;
