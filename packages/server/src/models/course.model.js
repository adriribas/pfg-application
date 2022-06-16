import { sequelize } from '../db';
import { DataTypes } from 'sequelize';

const Course = sequelize.define('Course', {
    number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        unique: true
    }
});

export default Course;
