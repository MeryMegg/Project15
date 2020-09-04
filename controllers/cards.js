const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .orFail(new NotFoundError('Карточки в базе данных отсутствуют'))
    .then((cards) => {
      // if (!cards.length) {
      //   res.status(404).send({ message: 'Карточки отсутствуют' });
      //   return;
      // }
      res.send({ data: cards });
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError(err.message);
        // res.status(400).send({ message: 'Некорректные данные в запросе' });
        // return;
      }
      next(error);
    });
};

module.exports.deleteUserId = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(new NotFoundError('Нет карточки с таким id'))
    .then((card) => {
      // if (!card) {
      //   res.status(404).send({ message: 'Карточка не найдена' });
      //   return;
      // }
      //if (card.owner.id !== req.user._id) {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Удалить можно только свою карточку');
        // res.status(403).send({ message: 'Удалить можно только свою карточку' });
        // return;
      }

      Card.deleteOne(card).then(() => res.send({ data: card }));
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } }, { new: true },
  )
    .orFail(new NotFoundError('Нет карточки с таким id'))
    .then((card) => {
      // if (!card) {
      //   res.status(404).send({ message: 'Карточка не найдена' });
      //   return;
      // }
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.id,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .orFail(new NotFoundError('Нет карточки с таким id'))
  .then((card) => {
    // if (!card) {
    //   res.status(404).send({ message: 'Карточка не найдена' });
    //   return;
    // }
    res.send({ data: card });
  })
  .catch(next);
