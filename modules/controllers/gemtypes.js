const createError = require('http-errors');
const db = require('../db');

exports.getAdd = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    const number = parseInt(req.query.number);
    res.render('addgemtypes', { number, ref: encodeURIComponent(req.url) });
  }
};

exports.add = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    const allGemTypes = req.body.name.map(name => new Object({ name }));
    db.createGemTypes(allGemTypes)
      .then(() => {
        res.redirect('/settings');
      })
      .catch(next);
  }
};

exports.getDelete = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.getGemType(req.params.id)
      .then(gemType => {
        if (gemType !== null) {
          res.render('deletegemtype', {
            gemType,
            ref: req.query.ref
          });
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};

exports.delete = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.deleteGemType(req.params.id)
      .then(result => {
        if (result === true) {
          res.redirect(req.body.ref);
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};

exports.getEdit = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.getGemType(req.params.id)
      .then(gemType => {
        if (gemType !== null) {
          res.render('editgemtype', {
            gemType,
            ref: req.query.ref
          });
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};

exports.edit = (req, res, next) => {
  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.updateGemType(
      req.params.id,
      req.body.name,
      req.body.deleted === 'on' ? true : false
    )
      .then(result => {
        if (result === true) {
          res.redirect(req.body.ref);
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};
