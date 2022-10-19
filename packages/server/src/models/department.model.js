import { DataTypes } from 'sequelize';
import Joi from 'joi';

import { db as sequelize } from '#r/startup';
import { hardDataUtil } from '#r/utils';

const Department = sequelize.define(
  'Department',
  {
    abv: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return hardDataUtil.getValue('departments', this.abv) || null;
      }
    }
  },
  {
    paranoid: true
  }
);

const addScopes = ({ School }) => {
  Department.addScope('school', schoolAbv => ({
    include: {
      model: School,
      where: { abv: schoolAbv },
      through: { attributes: [] },
      attributes: []
    }
  }));
};

Department.associate = ({ User, School, SchoolDepartment, Area }) => {
  Department.belongsTo(User, { foreignKey: 'director' });

  Department.belongsToMany(School, {
    through: SchoolDepartment,
    foreignKey: 'department',
    otherKey: 'school'
  });
  Department.hasMany(SchoolDepartment, { foreignKey: 'department' });

  Department.hasMany(Area, { foreignKey: 'department' });

  addScopes({ School });
};

Department.updatableFields = ['director'];

const validationSchema = Joi.object({
  abv: Joi.string().min(2).max(8).required()
});
Department.validate = data => validationSchema.validate(data);

export default Department;
