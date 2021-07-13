const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const cards = require('../controllers/cards');
const auth = require('../middlewares/auth');
const { urlValidator } = require('../utils/utils');

router.put(
  '/:cardId/likes',
  auth,
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24).hex(),
    }),
  }),
  cards.likeCard,
);
router.delete(
  '/:cardId/likes',
  auth,
  celebrate({
    body: Joi.object().keys({
      cardId: Joi.string().length(24).hex(),
    }),
  }),
  cards.dislikeCard,
);
router.delete(
  '/:cardId',
  celebrate({
    body: Joi.object().keys({
      cardId: Joi.string().length(24).hex(),
    }),
  }),
  auth,
  cards.removeCard,
);
router.get('/', auth, cards.getCards);
router.post(
  '/',
  auth,
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      link: Joi.string().custom(urlValidator),
    }),
  }),
  cards.createCard,
);

module.exports = router;
