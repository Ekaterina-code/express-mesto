const Card = require('../models/card');
const {
  asyncHandler,
  sendSuccess,
  throwBadRequestError,
  throwNotFoundError,
  throwInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  cardForRemoveNotFound: 'Карточка с указанным _id не найдена среди созданных данным пользователем.',
  cardNotFound: 'Карточка с указанным _id не найдена.',
  createCardBadRequest: 'Переданы некорректные данные при создании карточки.',
  removeCardBadRequest: 'Переданы некорректные данные при удалении карточки.',
  likeCardBadRequest: 'Переданы некорректные данные для постановки/снятии лайка.',
};

module.exports.getCards = asyncHandler((_, res) => Card.find({})
  .then((cards) => sendSuccess(res, cards)));

module.exports.removeCard = asyncHandler((req, res) => {
  const { cardId } = req.params;
  return Card.findOneAndRemove({ _id: cardId, owner: req.user._id })
    .orFail(() => throwNotFoundError(errorMessages.cardForRemoveNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => {
      if (error.name === 'CastError') throwBadRequestError(errorMessages.removeCardBadRequest);
      if (error.statusCode === 404) throwNotFoundError(error);
      throwInternalServerError();
    });
});

module.exports.createCard = asyncHandler((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => sendSuccess(res, card))
    .catch((error) => {
      if (error.name === 'ValidationError') throwBadRequestError(errorMessages.createCardBadRequest);
      throwInternalServerError();
    });
});

module.exports.likeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => throwNotFoundError(errorMessages.cardNotFound))
  // Валидировать наличие пользователя в БД избыточно, т.к. мы получаем его ID через токен,
  // который генерируется апи, только при наличии самого пользователя в базе.
  // Если удалось потделать токен и подставить туда несущесвующий ID:
  // то речь идёт о проблеме в безопасности (скомпроментирован секрет).
  // Также несущесвующий пользователь может присутсвовать в случае, когда его удалили. В такм случае
  // необходимо реализовать механизм проверки/отзыва токенов, т.к. после удаления пользователь
  // не должен иметь доступа к апи.
  .then(() => sendSuccess(res))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.likeCardBadRequest);
    if (error.statusCode === 404) throwNotFoundError(error);
    throwInternalServerError();
  }));

module.exports.dislikeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => throwNotFoundError(errorMessages.cardNotFound))
  .then(() => sendSuccess(res))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.likeCardBadRequest);
    if (error.statusCode === 404) throwNotFoundError(error);
    throwInternalServerError();
  }));
