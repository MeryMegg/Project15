const router = require('express').Router();
const {
  getCards, createCard, deleteUserId, likeCard, dislikeCard,
} = require('../controllers/cards');
const auth = require('../middlewares/auth');

router.get('/', auth, getCards);
router.post('/', auth, createCard);
router.delete('/:id', auth, deleteUserId);
router.put('/:id/likes', auth, likeCard);
router.delete('/:id/likes', auth, dislikeCard);
module.exports = router;
