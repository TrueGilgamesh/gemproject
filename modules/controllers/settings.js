const createError = require('http-errors');
const db = require('../db');

exports.get = (req, res, next) => {
  if (!res.locals.user.master) {
    next(createError(403));
  } else {
    const filter = {
      name: req.query.name || '',
      deleted: req.query.deleted === 'on' ? true : false
    };
    Promise.all([db.getGemTypes(filter), db.getSettings()])
      .then(result => {
        const options = {
          gemTypes: result[0],
          settings: result[1],
          filter,
          ref: encodeURIComponent(req.url)
        };
        res.render('pages/settings', options);
      })
      .catch(next);
  }
};

exports.post = (req, res, next) => {
  db.updateSettings({
    c1: req.body.c1,
    c2: req.body.c2,
    c3: req.body.c3
  })
    .then(() => {
      res.redirect('/settings');
    })
    .catch(next);
};
