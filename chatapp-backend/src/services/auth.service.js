const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { createUserSchema, loginSchema } = require('../validators/auth.validator');
const { duplicateRecord, invalidRequest, unauthorized } = require('../utils/errorFactory');
const { EMAIL_ALREADY_EXISTS, MOBILE_ALREADY_EXISTS, INVALID_CREDENTIALS } = require('../constants/errorCodes');

exports.login = async (payload) => {

    const user = await User.findOne({
        where: { email: payload.email }
    });

    if (!user) {
        throw unauthorized("Invalid email or password", INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (!isMatch) {
        throw unauthorized("Invalid email or password", INVALID_CREDENTIALS);
    }

    const token = generateToken({ id: user.id, email: user.email });
    return { user, token };
}

exports.register = async (userData) => {

    const existingEmail = await User.findOne({ where: { email: userData.email } });
    if (existingEmail) {
        throw duplicateRecord("Email already exists", EMAIL_ALREADY_EXISTS);
    }

    const existingMobile = await User.findOne({
        where: {
            mobile_number: userData.mobile_number
        }
    });

    if (existingMobile) {
        throw duplicateRecord("Mobile number already exists", MOBILE_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    return await User.create(userData);
};