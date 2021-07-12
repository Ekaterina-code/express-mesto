const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

const {
  asyncHandler,
  sendSuccess,
  throwBadRequestError,
  throwNotFoundError,
  throwInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  createUserBadRequest: 'Переданы некорректные данные при создании пользователя.',
  updateProfileBadRequest: 'Переданы некорректные данные при обновлении профиля.',
  getProfileBadRequest: 'Переданы некорректные данные при получаении профиля.',
  updateAvatarBadRequest: 'Переданы некорректные данные при обновлении аватара.',
  userNotFound: 'Пользователь по указанному не найден.',
};

const getUser = (userId, req, res) => User
  .findOne({ _id: userId })
  .orFail(() => throwNotFoundError(res, errorMessages.userNotFound))
  .then((user) => sendSuccess(res, user))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.getProfileBadRequest);
    else throwInternalServerError();
  });

module.exports.getUsers = asyncHandler((req, res) => User
  .find({})
  .then((users) => res.send(users))
  .catch(() => { throwInternalServerError(); }));

module.exports.createUser = asyncHandler((req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  return bcrypt.hash(password, 10)
    .then((passwordHash) => User
      .create({
        name,
        about,
        avatar,
        email,
        password: passwordHash,
      })
      .then((user) => sendSuccess(res, user))
      .catch((error) => {
        if (error.name === 'ValidationError') throwBadRequestError(errorMessages.createUserBadRequest);
        if (error.name === 'MongoError' && error.code === 11000) {
          const err = new Error('Пользователь уже существует');
          err.statusCode = 409;
          throw err;
        }
        throwInternalServerError();
      }));
});

module.exports.getUser = asyncHandler((req, res) => getUser(req.params.userId, req, res));
module.exports.getCurrentUser = asyncHandler((req, res) => getUser(req.user._id, req, res));

module.exports.editCurrentUser = asyncHandler((req, res) => {
  const { name, about } = req.body;
  return User
    .findByIdAndUpdate({ _id: req.user._id }, { name, about }, { runValidators: true, new: true })
    .orFail(() => throwNotFoundError(res, errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') throwBadRequestError(res, errorMessages.updateProfileBadRequest);
      else throwInternalServerError(res);
    });
});

module.exports.setCurrentUserAvatar = asyncHandler((req, res) => {
  const userId = req.user._id;
  return User
    .findByIdAndUpdate(
      { _id: userId },
      { avatar: req.body.avatar },
      { runValidators: true, new: true },
    )
    .orFail(() => throwNotFoundError(errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') throwBadRequestError(errorMessages.updateAvatarBadRequest);
      else throwInternalServerError();
    });
});

module.exports.login = asyncHandler((req, res) => {
  const incorrectPasswordErrorName = 'IncorrectPassword';
  const { NODE_ENV, JWT_SECRET } = process.env;
  const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';
  return User
    .findOne({ email: req.body.email }).select('+password')
    .orFail(() => throwNotFoundError(errorMessages.userNotFound))
    .then((user) => bcrypt
      .compare(req.body.password, user.password)
      .then((matched) => {
        if (!matched) {
          const error = new Error('Неправильные почта или пароль');
          error.name = incorrectPasswordErrorName;
          error.code = 401;
          Promise.reject(error);
        }
        const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
        res.cookie('token', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
        return sendSuccess(res, { _id: user._id });
      }))
    .catch((error) => {
      if (error.name === 'CastError') throwBadRequestError(errorMessages.userNotFound);
      if (error.name === incorrectPasswordErrorName) res.status(error.code).send(error.message);
      if (error.statusCode === 404) throwNotFoundError(error.message);
      throwInternalServerError();
    });
});
