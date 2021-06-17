const User = require('../models/user');
const { createNotFoundError } = require('../utils/errors');
const { asyncHandler, sendSuccess, mapError } = require('../utils/utils');

const errorMessages = {
  createUserBadRequest: 'Переданы некорректные данные при создании пользователя.',
  updateProfileBadRequest: 'Переданы некорректные данные при обновлении профиля.',
  updateAvatarBadRequest: 'Переданы некорректные данные при обновлении аватара.',
  userNotFound: 'Пользователь по указанному _id не найден.',
};

module.exports.getUsers = asyncHandler((req, res) => User
  .find({})
  .then((users) => res.send(users)));

module.exports.createUser = asyncHandler((req, res) => {
  const { name, about, avatar } = req.body;
  return User
    .create({ name, about, avatar })
    .then((user) => sendSuccess(res, user))
    .catch((error) => { throw mapError(error, errorMessages.createUserBadRequest); });
});

module.exports.getUser = asyncHandler((req, res) => User
  .findOne({ _id: req.params.userId })
  .orFail(() => createNotFoundError(errorMessages.userNotFound))
  .then((user) => sendSuccess(res, user)));

module.exports.editCurrentUser = asyncHandler((req, res) => {
  const { name, about } = req.body;
  return User
    .findByIdAndUpdate({ _id: req.user._id }, { name, about }, { runValidators: true })
    .orFail(() => createNotFoundError(errorMessages.userNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => { throw mapError(error, errorMessages.updateProfileBadRequest); });
});

module.exports.setCurrentUserAvatar = asyncHandler((req, res) => {
  const userId = req.user._id;
  return User
    .findByIdAndUpdate({ _id: userId }, { avatar: req.body.avatar })
    .orFail(() => createNotFoundError(errorMessages.userNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => { throw mapError(error, errorMessages.updateAvatarBadRequest); });
});
