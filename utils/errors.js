const HttpStatus = require('http-status-codes');
const ApiError = require('./ApiError');

module.exports.createNotFoundError = (message) => new ApiError(message, HttpStatus.NOT_FOUND);
module.exports.createBadRequestError = (message) => new ApiError(message, HttpStatus.BAD_REQUEST);
