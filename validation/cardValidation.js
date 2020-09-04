const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const validator = require('validator');
const BadRequestError = require('../errors/bad-request-err');

module.exports.createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30)
      .error(() => new BadRequestError('Поле `name` обязательное для заполнения и должно содержать от 2 до 30 символов')),
    link: Joi.string().required()
      .custom((value, helpers) => (validator.isURL(value) ? value : helpers.error()))
      .error(() => new BadRequestError('Поле `link` обязательное для заполнения и должно содержать корректную ссылку')),
  }),
});

module.exports.cardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId()
      .error(() => new BadRequestError('Некорректный id карточки')),
  }),
});
