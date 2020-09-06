const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const validator = require('validator');
const BadRequestError = require('../errors/bad-request-err');

const name = Joi.string().trim().min(2)
  .max(30)
  .required()
  .error(() => new BadRequestError('Поле `name` обязательное для заполнения и должно содержать от 2 до 30 символов'));
const about = Joi.string().trim().min(2)
  .max(30)
  .required()
  .error(() => new BadRequestError('Поле `about` обязательное для заполнения и должно содержать от 2 до 30 символов'));
const avatar = Joi.string().trim().required()
  .custom((value, helpers) => (validator.isURL(value) ? value : helpers.error()))
  .error(() => new BadRequestError('Поле `avatar` обязательное для заполнения и должно содержать корректную ссылку'));
const email = Joi.string().trim().required()
  .custom((value, helpers) => (validator.isEmail(value) ? value : helpers.error()))
  .error(() => new BadRequestError('Поле `email` обязательное для заполнения и должно содержать корректный email'));
const password = Joi.string().alphanum().trim().min(8)
  .required()
  .error(() => new BadRequestError('Поле `password` обязательное для заполнения и должно содержать не менее 8 символов'));
const id = Joi.objectId()
  .error(() => new BadRequestError('Некорректный id пользователя'));

module.exports.userIdValidation = celebrate({
  params: Joi.object().keys({
    id,
  }),
});

module.exports.createUserValidation = celebrate({
  body: Joi.object().keys({
    name, about, avatar, email, password,
  }),
});

module.exports.updateUserProfileValidation = celebrate({
  body: Joi.object().keys({
    name, about,
  }),
});

module.exports.updateUserAvatarValidation = celebrate({
  body: Joi.object().keys({
    avatar,
  }),
});

module.exports.loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email()
      .error(() => new BadRequestError('Неверный адрес электронной почты или пароль')),
    password: Joi.string().required().min(8)
      .error(() => new BadRequestError('Неверный адрес электронной почты или пароль')),
  }),
});
