const bcrypt = require('bcrypt');

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { recordNotFound } = require('../utils/errorFactory');
const sequelize = require('../config/db');

exports.getUserById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw recordNotFound("User not found");
    }
    return user;
};

exports.getAllUsers = async () => {
    const users = await User.findAll();
    return users;
};

exports.getUserContacts = async (userId) => {
    const contacts = await sequelize.query(`
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
        ORDER BY u.full_name
    `, {
        replacements: {
            userId
        },
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
}