const { INVALID_TOKEN } = require('../constants/errorCodes');
const { unauthorized } = require('../utils/errorFactory');
const jwt = require('../utils/jwt');
module.exports = (req, res, next) => {
    try {
        let token;

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            throw unauthorized("No token provided.");
        }

        const decoded = jwt.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        throw unauthorized(error.message || "Invalid token.", error.errorCode || INVALID_TOKEN);
    }
};