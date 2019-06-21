const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const createError = require('http-errors');
const config = require('../config');
const controllers = require('./controllers');
const router = require('./router');

const app = express();

// местоположение шаблонов
app.set('views', path.join(__dirname, '../views'));

// использовать движок шаблонов pug
app.set('view engine', 'pug');

// раздавать файлы из подкаталога public
app.use(express.static(path.join(__dirname, '../public')));

// обрабатывать тело запросов JSON
app.use(express.json());

// обрабатывать тело запросов в кодировке URL
app.use(express.urlencoded({ extended: true }));

// обрабатывать cookie
app.use(cookieParser());

// использовать сессии
app.use(cookieSession(config.session));

// проверить сессию и установить данные пользователя в res.locals
app.use(controllers.middleware.checkUserSession);

// маршрутизация
app.use(router);

// обработчик 404 - ресурс не найден (маршрут не задан)
app.use((req, res, next) => {
  // создать ошибку и передать обработчику ошибок
  next(createError(404));
});

// обработчик ошибок
app.use((err, req, res, next) => {
  // установить локальные переменные, ошибку передавать только при разработке
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : undefined;

  // вывести страницу ошибки
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
