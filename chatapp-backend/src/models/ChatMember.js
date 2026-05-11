const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Chat = require('./Chat');
const User = require('./User');
const ChatMessage = require('./ChatMessage');

const ChatMember = sequelize.define("ChatMember", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chats',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    left_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    chat_cleared_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_read_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'chat_messages',
            key: 'id'
        }
    },
    role: {
    type: DataTypes.ENUM("ADMIN", "MEMBER"),
    defaultValue: "MEMBER"
}
}, {
    tableName: "chat_members",
    timestamps: true
});

Chat.hasMany(ChatMember, { foreignKey: 'chat_id', as: 'members' });
Chat.hasMany(ChatMember, { foreignKey: "chat_id", as: "allMembers" });
ChatMember.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

Chat.hasMany(ChatMessage, { foreignKey: 'chat_id', as: 'ChatMessages' });
ChatMessage.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

User.hasMany(ChatMember, { foreignKey: 'user_id', as: 'chatMemberships' });
ChatMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });

module.exports = ChatMember;