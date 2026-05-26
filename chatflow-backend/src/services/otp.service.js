const redis = require("../config/redis");
const User = require("../models/User");
const { invalidRequest } = require("../utils/errorFactory");
const AppError = require("../utils/AppError");
const { generateOtp, generateResetToken, verifyResetToken } = require("../utils/otp");
const emailService = require("./email.service");

const OTP_EXPIRY_SECONDS = 5 * 60;
const RESET_TOKEN_EXPIRY_SECONDS = 10 * 60;
const MAX_OTP_ATTEMPTS = 5;
const FORGOT_PASSWORD_RATE_LIMIT_MAX = Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX || 5);
const FORGOT_PASSWORD_RATE_LIMIT_WINDOW = Number(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW || 15 * 60);
const RATE_LIMIT_ERROR = "TOO_MANY_REQUESTS";

const normalizeEmail = (email) => String(email).trim().toLowerCase();
const getOtpKey = (email) => `forgot:otp:${email}`;
const getAttemptsKey = (email) => `forgot:attempts:${email}`;
const getRateLimitKey = (email) => `forgot:rate:${email}`;
const getResetKey = (token) => `forgot:reset:${token}`;

exports.sendPasswordResetOtp = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const rateKey = getRateLimitKey(normalizedEmail);

  const requestCount = await redis.incr(rateKey);
  if (requestCount === 1) {
    await redis.expire(rateKey, FORGOT_PASSWORD_RATE_LIMIT_WINDOW);
  }

  if (requestCount > FORGOT_PASSWORD_RATE_LIMIT_MAX) {
    throw new AppError(
      "Too many OTP requests. Please try again later.",
      429,
      RATE_LIMIT_ERROR
    );
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    console.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
    return;
  }

  const otp = generateOtp();
  await redis.set(getOtpKey(normalizedEmail), otp, "EX", OTP_EXPIRY_SECONDS);
  await emailService.sendForgotPasswordOtpEmail(normalizedEmail, otp);
};

exports.verifyPasswordResetOtp = async (email, otp) => {
  const normalizedEmail = normalizeEmail(email);
  const otpKey = getOtpKey(normalizedEmail);
  const attemptsKey = getAttemptsKey(normalizedEmail);

  const savedOtp = await redis.get(otpKey);
  if (!savedOtp || savedOtp !== otp) {
    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) {
      await redis.expire(attemptsKey, OTP_EXPIRY_SECONDS);
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
      await redis.del(otpKey, attemptsKey);
    }

    throw invalidRequest("Invalid or expired OTP. Please try again.");
  }

  await redis.del(otpKey, attemptsKey);
  const resetToken = generateResetToken({ email: normalizedEmail });
  await redis.set(getResetKey(resetToken), normalizedEmail, "EX", RESET_TOKEN_EXPIRY_SECONDS);

  return resetToken;
};

exports.validateResetToken = async (token) => {
  const decoded = verifyResetToken(token);
  const resetKey = getResetKey(token);
  const storedEmail = await redis.get(resetKey);

  if (!storedEmail || storedEmail !== decoded.email) {
    throw invalidRequest("Invalid or expired reset token");
  }

  return decoded;
};