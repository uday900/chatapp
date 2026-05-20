const bcrypt = require('bcrypt');

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { recordNotFound, duplicateRecord } = require('../utils/errorFactory');
const sequelize = require('../config/db');

exports.getUserById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw recordNotFound("User not found");
    }
    return user;
};

exports.updateUser = async (userId, { full_name, profile_picture }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw recordNotFound("User not found");
    }
    if (full_name) {
        user.full_name = full_name;
    }
    if (profile_picture) {
        user.profile_picture = profile_picture;
    }
    await user.save();
    return user;
}

exports.updateEmail = async (userId, newEmail) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw recordNotFound("User not found");
    }
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== userId) {
        throw duplicateRecord("Email is already in use by another user");
    }
    user.email = newEmail;
    await user.save();
    return user;
};

exports.updateMobileNumber = async (userId, newMobileNumber) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw recordNotFound("User not found");
    }
    const existingUser = await User.findOne({ where: { mobile_number: newMobileNumber } });
    if (existingUser && existingUser.id !== userId) {
        throw duplicateRecord("Mobile number is already in use by another user");
    }
    user.mobile_number = newMobileNumber;
    await user.save();
    return user;
}

exports.getAllUsers = async () => {
    const users = await User.findAll();
    return users;
};

exports.getUserContacts = async (userId, searchQuery = null) => {
    let query = `
        SELECT DISTINCT
            u.id,
            u.full_name,
            u.profile_picture,
            u.mobile_number
        FROM chat_members cm1
        JOIN chat_members cm2
            ON cm1.chat_id = cm2.chat_id
        JOIN users u
            ON u.id = cm2.user_id
        WHERE cm1.user_id = :userId
          AND cm2.user_id != :userId
    `;

    const replacements = { userId };

    if (searchQuery && searchQuery.trim()) {
        const searchTerm = `%${searchQuery.trim()}%`;
        query += ` AND (
  LOWER(u.full_name) LIKE LOWER(:searchTerm)
  OR LOWER(u.mobile_number) LIKE LOWER(:searchTerm)
)`; replacements.searchTerm = searchTerm;
    }

    query += ` ORDER BY u.full_name`;

    const contacts = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return contacts;
};

exports.getUserByMobileNumber = async (mobileNumber) => {
    const user = await User.findOne({ where: { mobile_number: mobileNumber } });
    if (!user) {
        throw recordNotFound("User not found");
    }
    return user;
};

exports.findUserByMobileNumber = async (mobileNumber) => {
    return await User.findOne({ where: { mobile_number: mobileNumber } });
};

exports.isUserContact = async (userId, targetUserId) => {
    const query = `
        SELECT 1
        FROM chat_members cm1
        JOIN chat_members cm2
            ON cm1.chat_id = cm2.chat_id
        WHERE cm1.user_id = :userId
          AND cm2.user_id = :targetUserId
        LIMIT 1
    `;

    const result = await sequelize.query(query, {
        replacements: { userId, targetUserId },
        type: sequelize.QueryTypes.SELECT
    });

    return result.length > 0;
};