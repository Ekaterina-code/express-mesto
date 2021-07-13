const jwt = require('jsonwebtoken');
const { createError } = require('../utils/utils');
require('dotenv').config();

module.exports = (req, res, next) => {
  const { token } = req.cookies;
  const { NODE_ENV, JWT_SECRET } = process.env;
  const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';
  const authErrorMessage = 'Необходима авторизация';
  if (!token) {
    throw createError(authErrorMessage, 403);
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (err) {
    throw createError(authErrorMessage, 401);
  }
};
