const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Chat = sequelize.define("Chat", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('ONE_TO_ONE', 'GROUP'),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profile_picture_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "chats",
    timestamps: true
});

module.exports = Chat;