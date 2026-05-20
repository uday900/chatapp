const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const { unauthorized } = require('./errorFactory');
const { INVALID_TOKEN, TOKEN_EXPIRED, UNAUTHORIZED, INVALID_RESET_TOKEN, RESET_TOKEN_EXPIRED } = require('../constants/errorCodes');

exports.generateToken = (payload, options = {}) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        options
    );
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(
                "Token has expired",
                401,
                TOKEN_EXPIRED
            );
        }
         if (error.name === "JsonWebTokenError") {
            throw new AppError(
                "Invalid token",
                401,
                INVALID_TOKEN
            );
        }

         throw new AppError(
            "Unauthorized",
            401,
            UNAUTHORIZED
        );
    }
};

exports.verifyResetToken = (
  token
) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.type !==
      "password_reset"
    ) {
      throw new AppError(
        "Invalid reset token",
        401,
        INVALID_RESET_TOKEN
      );
    }

    return decoded;
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      throw new AppError(
        "Reset session expired",
        401,
        RESET_TOKEN_EXPIRED
      );
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      throw new AppError(
        "Invalid reset token",
        401,
        INVALID_RESET_TOKEN
      );
    }

    throw error;
  }
};