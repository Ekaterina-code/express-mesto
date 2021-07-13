const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const users = require('../controllers/users');
const { throwNotFoundError } = require('../utils/utils');

router.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email(),
      password: Joi.string().required(),
    }),
  }),
  users.login);

router.post('/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().min(2).max(30),
      password: Joi.string().required().min(2).max(30),
    }),
  }),
  users.createUser);

router.all('*', () => {
  throwNotFoundError('Страница не найдена');
});
module.exports = router;
