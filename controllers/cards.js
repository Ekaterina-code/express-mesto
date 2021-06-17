const Card = require('../models/card');
const { createBadRequestError, createNotFoundError } = require('../utils/errors');
const { asyncHandler, sendSuccess, mapError } = require('../utils/utils');

const errorMessages = {
  cardNotFound: 'Карточка с указанным _id не найдена.',
  createCardBadRequest: 'Переданы некорректные данные при создании карточки.',
  likeCardBadRequest: 'Переданы некорректные данные для постановки/снятии лайка.',
};

module.exports.getCards = asyncHandler((_, res) => Card.find({})
  .then((cards) => sendSuccess(res, cards)));

module.exports.removeCard = asyncHandler((req, res) => {
  const { cardId } = req.params;
  return Card.findByIdAndRemove(cardId)
    .orFail(() => createNotFoundError(errorMessages.cardNotFound))
    .then(() => sendSuccess(res));
});

module.exports.createCard = asyncHandler((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return Card.create({ name, link, owner })
    .then((card) => sendSuccess(res, card))
    .catch((error) => { throw mapError(error, errorMessages.createCardBadRequest); });
});

module.exports.likeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => createBadRequestError(errorMessages.likeCardBadRequest))
  .then(() => sendSuccess(res)));

module.exports.dislikeCard = asyncHandler((req, res) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => createBadRequestError(errorMessages.likeCardBadRequest))
  .then(() => sendSuccess(res)));
