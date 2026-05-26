const bcrypt = require('bcrypt');
const User = require('../models/User');
const otpService = require('./otp.service');
const { duplicateRecord, invalidRequest, recordNotFound, unauthorized } = require('../utils/errorFactory');
const { generateToken } = require('../utils/jwt');
const {
  EMAIL_ALREADY_EXISTS,
  MOBILE_ALREADY_EXISTS,
  INVALID_CREDENTIALS,
  USER_NOT_FOUND
} = require('../constants/errorCodes');

exports.login = async (payload) => {
  const user = await User.findOne({
    where: { email: payload.email }
  });

  if (!user) {
    throw unauthorized('Invalid email or password', INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw unauthorized('Invalid email or password', INVALID_CREDENTIALS);
  }

  const token = generateToken({ id: user.id, email: user.email });
  return { user, token };
};

exports.register = async (userData) => {
  const existingEmail = await User.findOne({ where: { email: userData.email } });
  if (existingEmail) {
    throw duplicateRecord('Email already exists', EMAIL_ALREADY_EXISTS);
  }

  const existingMobile = await User.findOne({
    where: {
      mobile_number: userData.mobile_number
    }
  });

  if (existingMobile) {
    throw duplicateRecord('Mobile number already exists', MOBILE_ALREADY_EXISTS);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;
  return await User.create(userData);
};

exports.sendForgotPasswordOtp = async (email) => {
  await otpService.sendPasswordResetOtp(email);
};

exports.verifyForgotPasswordOtp = async (email, otp) => {
  return await otpService.verifyPasswordResetOtp(email, otp);
};

exports.resetPassword = async (resetToken, newPassword) => {
  const payload = await otpService.validateResetToken(resetToken);
  const user = await User.findOne({ where: { email: payload.email } });

  if (!user) {
    throw recordNotFound('User not found', USER_NOT_FOUND);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
};