import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';

const School = sequelize.define(
  'School',
  {
    abv: {
      type: DataTypes.STRING(8),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    currentStartYear: DataTypes.SMALLINT,
    currentEndYear: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.currentStartYear) {
          return null;
        }
        return this.currentStartYear + 1;
      },
      set() {
        throw new Error('Current end year cannot be set');
      }
    }
  },
  { paranoid: true }
);

School.associate = ({ User, Study, Department, SchoolDepartment }) => {
  School.hasMany(User, { foreignKey: 'school' });

  School.hasMany(Study, { foreignKey: 'school' });

  School.belongsToMany(Department, {
    through: SchoolDepartment,
    foreignKey: 'school',
    otherKey: 'department'
  });
  School.hasMany(SchoolDepartment, { foreignKey: 'school' });
};

School.updatableFields = ['name', 'currentStartYear'];

const validationSchema = Joi.object({
  abv: Joi.string().min(2).max(20).required(),
  name: Joi.string().min(2).max(100).required(),
  currentStartYear: Joi.number().min(2022).max(3022)
});
School.validate = data => validationSchema.validate(data);

export default School;
