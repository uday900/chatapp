const { INTERNAL_SERVER_ERROR } = require("../constants/errorCodes");

module.exports = (err, req, res, next) => {
    console.error(err.stack);

    err.statusCode = err.statusCode || 500;
    err.errorCode = err.errorCode || INTERNAL_SERVER_ERROR;
    err.message = err.message || 'Some error occurred. Please try again later.';

    res.status(err.statusCode).json({
        success: false,
        errorCode: err.errorCode,
        message: err.message || 'Some error occurred. Please try again later.'
    });
}