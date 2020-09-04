require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
//const rateLimit = require('express-rate-limit');
const { isCelebrate } = require('celebrate');

const { PORT = 3000 } = process.env;
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');
const routerCards = require('./routes/cards');
const routerUsers = require('./routes/users');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/not-found-err');
const { createUserValidation, loginValidation } = require('./validation/userValidation');

const app = express();
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Количество запросов привысило допустимое значение, пожалуйста попробуйте позже',
// });

app.use(helmet());
//app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(auth);
app.use('/users', routerUsers);
app.use('/cards', routerCards);

app.use((req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

app.use((err, req, res, next) => {
  const { statusCode = isCelebrate(err) ? 400 : 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  return next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
