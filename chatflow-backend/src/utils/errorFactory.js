const { 
    INVALID_REQUEST_BODY, 
    RESOURCE_NOT_FOUND, 
    DUPLICATE_RECORD, 
    INTERNAL_SERVER_ERROR, 
    UNAUTHORIZED
} = require("../constants/errorCodes");
const AppError = require("./AppError");


exports.invalidRequest = (message = "Invalid request") => {
    return new AppError(message, 400, INVALID_REQUEST_BODY);
}

exports.recordNotFound = (message = "Record not found") => {
    return new AppError(message, 404, RESOURCE_NOT_FOUND);
}

exports.unauthorized = (message = "Unauthorized", errorCode = UNAUTHORIZED) => {
    return new AppError(message, 401, errorCode);
}

exports.duplicateRecord = (message = "Duplicate record", errorCode = DUPLICATE_RECORD) => {
    return new AppError(message, 409, errorCode);
}

exports.appError = (message, statusCode = 500, errorCode = INTERNAL_SERVER_ERROR) => {
    return new AppError(message, statusCode, errorCode);
}