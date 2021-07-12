const Card = require('../models/card');
const {
  asyncHandler,
  sendSuccess,
  throwBadRequestError,
  throwNotFoundError,
  throwInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  cardNotFound: 'Карточка с указанным _id не найдена.',
  createCardBadRequest: 'Переданы некорректные данные при создании карточки.',
  removeCardBadRequest: 'Переданы некорректные данные при удалении карточки.',
  likeCardBadRequest: 'Переданы некорректные данные для постановки/снятии лайка.',
};

module.exports.getCards = asyncHandler((_, res) => Card.find({})
  .then((cards) => sendSuccess(res, cards)));

module.exports.removeCard = asyncHandler((req, res) => {
  const { cardId } = req.params;
  return Card.findByIdAndRemove(cardId)
    .orFail(() => throwNotFoundError(errorMessages.cardNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => {
      if (error.name === 'CastError') throwBadRequestError(errorMessages.removeCardBadRequest);
      else throwInternalServerError();
    });
});

module.exports.createCard = asyncHandler((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => sendSuccess(res, card))
    .catch((error) => {
      if (error.name === 'ValidationError') throwBadRequestError(errorMessages.createCardBadRequest);
      else throwInternalServerError();
    });
});

module.exports.likeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => throwBadRequestError(errorMessages.cardNotFound))
  .then(() => sendSuccess(res))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.likeCardBadRequest);
    else throwInternalServerError();
  }));

module.exports.dislikeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => throwBadRequestError(errorMessages.cardNotFound))
  .then(() => sendSuccess(res))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.likeCardBadRequest);
    else throwInternalServerError();
  }));
