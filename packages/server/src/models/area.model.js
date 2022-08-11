import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const Area = sequelize.define(
  'Area',
  {
    abv: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      set(abv) {
        this.setDataValue('name', hardDataUtil.getValue('areas', abv) || abv);
      }
    }
  },
  { paranoid: true }
);

Area.associate = ({ User, Department, Subject, AreaSubject }) => {
  Area.belongsTo(User, { foreignKey: 'responsable' }); // Responsable de docència
  Area.hasMany(User, { foreignKey: 'area' }); // Professors

  Area.belongsTo(Department, { foreignKey: 'department' });

  Area.belongsToMany(Subject, { through: AreaSubject, foreignKey: 'area', otherKey: 'subject' });
  Area.hasMany(AreaSubject, { foreignKey: 'area' });
};

const validationSchema = Joi.object({
  abv: Joi.string().min(2).max(10).required()
});
Area.validate = data => validationSchema.validate(data);

export default Area;
