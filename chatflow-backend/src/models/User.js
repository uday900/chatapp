const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "users",
    timestamps: true
});

module.exports = User;