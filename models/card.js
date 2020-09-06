const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Это поле обязательное для заполнения'],
    minlength: [2, 'Длина названия карточки от 2 до 30 символов'],
    maxlength: [30, 'Длина имени от 2 до 30 символов'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  link: {
    type: String,
    validate: {
      validator: (link) => validator.isURL(link),
      message: (props) => `${props.value} некорректный адрес!`,
    },
    required: [true, 'Это поле обязательное для заполнения'],
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    required: [true, 'Это поле обязательное для заполнения'],
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
