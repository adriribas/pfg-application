import { sequelize } from '../db';
import { DataTypes } from 'sequelize';

const Semester = sequelize.define('Semester', {
    number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        unique: true
    }
});

export default Semester;
