import { DataTypes } from 'sequelize';

import { db as sequelize } from '../startup';

const Semester = sequelize.define('Semester', {
    number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        unique: true
    }
});

export default Semester;
