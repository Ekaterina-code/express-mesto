const HttpStatus = require('http-status-codes');

const defaultError = 'Ошибка по умолчанию.';

const sendError = (res, data, code) => res.status(code).send({ message: data || defaultError });

// Параметр 'next' не используется, но необходим для корректной работы промежуточного слоя
// eslint-disable-next-line no-unused-vars
module.exports.errorHandler = (error, req, res, next) => {
  res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({ message: defaultError });
};

module.exports.asyncHandler = (fn) => (req, res, next) => Promise
  .resolve(fn(req, res, next))
  .catch((error) => next(error));

module.exports.sendSuccess = (res, data) => res
  .status(HttpStatus.OK)
  .send(data || { message: 'success' });

module.exports.sendNotFoundError = (res, message) => sendError(res, message, HttpStatus.NOT_FOUND);

module.exports.sendBadRequestError = (res, message) => {
  sendError(res, message, HttpStatus.BAD_REQUEST);
};

module.exports.sendInternalServerError = (res) => {
  sendError(res, defaultError, HttpStatus.INTERNAL_SERVER_ERROR);
};
