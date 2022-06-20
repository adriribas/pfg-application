import { DataTypes } from 'sequelize';

import { db as sequelize } from '../startup';

const Course = sequelize.define('Course', {
    number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        unique: true
    }
});

export default Course;
