const { INTERNAL_SERVER_ERROR } = require("../constants/errorCodes");

class AppError extends Error {
    constructor (
        message = "Something went wrong. Please try again later", 
        statusCode = 500,
        errorCode = INTERNAL_SERVER_ERROR
    ) {
        super(message);

        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;

        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);    
    }
}

module.exports = AppError;