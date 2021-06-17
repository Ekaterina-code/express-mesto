const HttpStatus = require('http-status-codes');
const ApiError = require('./ApiError');
const { createBadRequestError } = require('./errors');

// Параметр 'next' не используется, но необходим для корректной работы промежуточного слоя
module.exports.errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res
      .status(error.statusCode)
      .json({ message: error.message });
  } else {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Ошибка по умолчанию.' });
  }
};

module.exports.asyncHandler = (fn) => (req, res, next) => Promise
  .resolve(fn(req, res, next))
  .catch((error) => next(error));

module.exports.sendSuccess = (res, data) => res.status(HttpStatus.OK).send(data || { message: 'success' });

module.exports.mapError = (error, badRequestErrormessage) => {
  if (error.name === 'ValidationError') {
    return createBadRequestError(badRequestErrormessage);
  }
  return error;
};
