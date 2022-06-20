import { DataTypes } from 'sequelize';

import { db as sequelize } from '../startup';

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
