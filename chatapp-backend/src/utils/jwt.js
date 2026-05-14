const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const { unauthorized } = require('./errorFactory');
const { INVALID_TOKEN, TOKEN_EXPIRED, UNAUTHORIZED } = require('../constants/errorCodes');

exports.generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        // { expiresIn: '24h' }
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
