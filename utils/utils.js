const HttpStatus = require('http-status-codes');

const defaultError = 'Ошибка по умолчанию.';

const createError = (data, statusCode) => {
  const error = new Error(data);
  error.statusCode = statusCode;
  return error;
};

module.exports.asyncHandler = (fn) => (req, res, next) => Promise
  .resolve(fn(req, res, next))
  .catch((error) => next(error));

module.exports.sendSuccess = (res, data) => res
  .status(HttpStatus.OK)
  .send(data || { message: 'success' });

module.exports.throwNotFoundError = (message) => {
  throw createError(message, HttpStatus.NOT_FOUND);
};

module.exports.throwBadRequestError = (message) => {
  throw createError(message, HttpStatus.BAD_REQUEST);
};

module.exports.throwInternalServerError = () => {
  throw createError(defaultError, HttpStatus.INTERNAL_SERVER_ERROR);
};
