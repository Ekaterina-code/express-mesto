const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const users = require('../controllers/users');
const auth = require('../middlewares/auth');
const { urlValidator } = require('../utils/utils');

router.patch(
  '/me/avatar',
  auth,
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().custom(urlValidator),
    }),
  }),
  users.setCurrentUserAvatar,
);

router.patch(
  '/me',
  auth,
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  users.editCurrentUser,
);
router.get('/me', auth, users.getCurrentUser);

router.get(
  '/:userId',
  auth,
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().length(24).hex(),
    }),
  }),
  users.getUser,
);

router.get('/', auth, users.getUsers);

module.exports = router;
