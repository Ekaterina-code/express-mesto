const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const cards = require('../controllers/cards');
const auth = require('../middlewares/auth');

router.put(
  '/:cardId/likes',
  auth,
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().guid(),
    }),
  }),
  cards.likeCard,
);
router.delete(
  '/:cardId/likes',
  auth,
  celebrate({
    body: Joi.object().keys({
      cardId: Joi.string().guid(),
    }),
  }),
  cards.dislikeCard,
);
router.delete(
  '/:cardId',
  celebrate({
    body: Joi.object().keys({
      cardId: Joi.string().guid(),
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
      link: Joi.string().min(2),
    }),
  }),
  cards.createCard,
);

module.exports = router;
