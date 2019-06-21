const db = require('../db');

exports.get = (req, res, next) => {
  if (req.app.locals.hasMaster) {
    next();
  } else {
    res.render('init');
  }
};

exports.post = (req, res, next) => {
  if (req.app.locals.hasMaster) {
    next();
  } else {
    Promise.all([
      db.createUser(
        req.body.login,
        req.body.password,
        req.body.name,
        'gnome',
        true
      ),
      db.createSettings()
    ])
      .then(() => {
        req.app.locals.hasMaster = true;
        res.redirect('/');
      })
      .catch(next);
  }
};
