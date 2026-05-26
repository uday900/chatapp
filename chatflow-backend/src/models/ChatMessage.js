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
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            key: "id"
        }
    }
    ,
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "chat_messages",
    timestamps: true,
    // Keep updatedAt nullable and set it to null on create via hook so it's only
    // populated when the message is later updated.
    updatedAt: true,
    createdAt: true,
    // We'll store deletedAt manually when marking messages deleted.
    
    hooks: {
        beforeCreate: (instance) => {
            instance.updatedAt = null;
        },
        beforeBulkCreate: (instances) => {
            instances.forEach(i => { i.updatedAt = null; });
        }
    }
});

module.exports = ChatMessage;
