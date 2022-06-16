import { sequelize } from '../db';
import { DataTypes } from 'sequelize';

const Degree = sequelize.define('Degree', {
    abv: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

export default Degree;
