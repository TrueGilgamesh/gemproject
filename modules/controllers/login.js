const db = require('../db');

exports.get = (req, res) => {
  res.render('login', { url: req.originalUrl });
};

exports.post = (req, res, next) => {
  db.checkUser(req.body.login, req.body.password)
    .then(result => {
      if (result === true) {
        db.beginSession(req.body.login)
          .then(sessionId => {
            req.session.id = sessionId;
            const url = req.query.ref || '/';
            res.redirect(url);
          })
          .catch(next);
      } else {
        res.render('login');
      }
    })
    .catch(next);
};

exports.logout = (req, res, next) => {
  db.closeSession(res.locals.user._id)
    .then(() => {
      req.session = null;
      res.redirect('/');
    })
    .catch(next);
};
