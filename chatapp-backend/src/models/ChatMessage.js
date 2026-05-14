const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define("ChatMessage", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reply_to_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'chat_messages',
            key: 'id'
        }
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chats',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        }
    }
}, {
    tableName: "chat_messages",
    timestamps: true
});

module.exports = ChatMessage;