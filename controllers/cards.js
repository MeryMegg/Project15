const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['likes'])
    .then((cards) => {
      if (!cards.length) {
        res.status(404).send({ message: 'Карточки отсутствуют' });
        return;
      }
      res.send({ data: cards });
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректные данные в запросе' });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.deleteUserId = (req, res) => {
  Card.findById(req.params.id)
    .populate('owner')
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
        return;
      }
      if (card.owner.id !== req.user._id) {
        res.status(401).send({ message: 'Удалить можно только свою карточку' });
        return;
      }

      Card.deleteOne(card).then(() => res.send({ data: card }));
    })
    .catch(() => {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } }, { new: true },
  )
    .populate('likes')
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
        return;
      }
      res.send({ data: card });
    })
    .catch(() => {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.id,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .populate('likes')
  .then((card) => {
    if (!card) {
      res.status(404).send({ message: 'Карточка не найдена' });
      return;
    }
    res.send({ data: card });
  })
  .catch(() => {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  });
