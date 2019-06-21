const db = require('../db');
const createError = require('http-errors');

exports.checkUserSession = (req, res, next) => {
  if (req.session.id !== undefined) {
    db.getUserBySessionId(req.session.id)
      .then(user => {
        if (user) {
          res.locals.user = user;
        }

        next();
      })
      .catch(next);
  } else {
    next();
  }
};

exports.checkInit = (req, res, next) => {
  if (req.app.locals.hasMaster) {
    next();
  } else {
    if (req.method === 'GET') {
      res.redirect('/init');
    } else {
      next(createError(503));
    }
  }
};

exports.checkLogin = (req, res, next) => {
  if (res.locals.user) {
    next();
  } else {
    if (req.method === 'GET') {
      res.redirect(
        '/login' +
          (req.url !== '/' ? '?ref=' + encodeURIComponent(req.url) : '')
      );
    } else {
      next(createError(401));
    }
  }
};
