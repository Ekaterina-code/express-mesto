const router = require('express').Router();
const users = require('../controllers/users');

router.patch('/me/avatar', users.setCurrentUserAvatar);
router.patch('/me', users.editCurrentUser);
router.get('/:userId', users.getUser);
router.get('/', users.getUsers);
router.post('/', users.createUser);

module.exports = router;
