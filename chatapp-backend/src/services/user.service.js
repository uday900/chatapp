const bcrypt = require('bcrypt');

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { recordNotFound } = require('../utils/errorFactory');

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