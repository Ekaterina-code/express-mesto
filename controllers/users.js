const User = require('../models/user');
const {
  asyncHandler,
  sendSuccess,
  sendBadRequestError,
  sendNotFoundError,
  sendInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  createUserBadRequest: 'Переданы некорректные данные при создании пользователя.',
  updateProfileBadRequest: 'Переданы некорректные данные при обновлении профиля.',
  getProfileBadRequest: 'Переданы некорректные данные при получаении профиля.',
  updateAvatarBadRequest: 'Переданы некорректные данные при обновлении аватара.',
  userNotFound: 'Пользователь по указанному _id не найден.',
};

module.exports.getUsers = asyncHandler((req, res) => User
  .find({})
  .then((users) => res.send(users))
  .catch(() => { sendInternalServerError(res); }));

module.exports.createUser = asyncHandler((req, res) => {
  const { name, about, avatar } = req.body;
  return User
    .create({ name, about, avatar })
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'ValidationError') sendBadRequestError(res, errorMessages.createUserBadRequest);
      else sendInternalServerError(res);
    });
});

module.exports.getUser = asyncHandler((req, res) => User
  .findOne({ _id: req.params.userId })
  .orFail(() => sendNotFoundError(res, errorMessages.userNotFound))
  .then((user) => sendSuccess(res, user))
  .catch((error) => {
    if (error.name === 'CastError') sendBadRequestError(res, errorMessages.getProfileBadRequest);
    else sendInternalServerError(res);
  }));

module.exports.editCurrentUser = asyncHandler((req, res) => {
  const { name, about } = req.body;
  return User
    .findByIdAndUpdate({ _id: req.user._id }, { name, about }, { runValidators: true, new: true })
    .orFail(() => sendNotFoundError(res, errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') sendBadRequestError(res, errorMessages.updateProfileBadRequest);
      else sendInternalServerError(res);
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
    .orFail(() => sendNotFoundError(errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') sendBadRequestError(res, errorMessages.updateAvatarBadRequest);
      else sendInternalServerError(res);
    });
});
