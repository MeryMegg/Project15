const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const AuthError = require('../errors/auth-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .orFail(new NotFoundError('Пользователи в базе данных отсутствуют'))
    .then((users) => {
      res.send({ data: users });
    })
    .catch(next);
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({ data: user.omitPrivate() }))
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError('Некорректные данные в запросе');
        next(error);
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        error = new ConflictError('Пользователь с данным e-mail уже зарегистрирован');
        next(error);
      }
      next(err);
    });
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => {
      if (!user.equals(req.user._id)) {
        throw new ForbiddenError('Вносить изменения можно только в свой профиль');
      }

      res.send({ data: user });
    })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError('Некорректные данные в запросе');
      }
      next(error);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => {
      if (!user.equals(req.user._id)) {
        throw new ForbiddenError('Изменить можно только свой аватар');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      let error;
      if (err.name === 'ValidationError') {
        error = new BadRequestError('Некорректные данные в запросе');
      }
      next(error);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, (process.env.JWT_SECRET || 'dev-secret'), { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true }).end('Авторизация прошла успешно');
    })
    .catch((err) => {
      let error;
      if (err.name === 'Error') {
        error = new AuthError('Неверный адрес электронной почты или пароль');
        next(error);
      }
      next(err);
    });
};
