const router = require('express').Router();
const cards = require('../controllers/cards');

router.put('/:cardId/likes', cards.likeCard);
router.delete('/:cardId/likes', cards.dislikeCard);
router.delete('/:cardId', cards.removeCard);
router.get('/', cards.getCards);
router.post('/', cards.createCard);

module.exports = router;
