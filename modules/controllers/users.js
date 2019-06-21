const createError = require('http-errors');
const db = require('../db');

exports.getList = (req, res, next) => {
  const filter = {
    name: req.query.name || '',
    deleted: req.query.deleted === 'on' ? true : false
  };

  db.getUsers(filter)
    .then(users => {
      res.render('pages/users', {
        page: 'users',
        users,
        filter,
        ref: encodeURIComponent(req.url)
      });
    })
    .catch(next);
};

exports.getCreate = (req, res, next) => {
  if (!['elf', 'gnome'].includes(req.query.role)) {
    next(createError(400));
  } else {
    res.render('createuser', { role: req.query.role });
  }
};

exports.create = (req, res, next) => {
  const master = req.body.master === 'on';

  if (!res.locals.user) {
    next(createError(401));
  } else if (res.locals.user.master === false) {
    next(createError(403));
  } else if (
    !['elf', 'gnome'].includes(req.body.role) ||
    (req.body.role === 'elf' && master === true)
  ) {
    next(createError(400));
  } else {
    db.createUser(
      req.body.login,
      req.body.password,
      req.body.name,
      req.body.role,
      master
    )
      .then(user => {
        res.redirect('/users');
      })
      .catch(next);
  }
};

exports.get = (req, res, next) => {
  db.getUser(req.params.id)
    .then(user => {
      if (user) {
        user.assignedGems.sort(
          (a, b) =>
            a.mineDate - b.mineDate ||
            a.assignDate - b.assignDate ||
            (a.owner > b.owner ? 1 : 0) ||
            (a.type.name > b.type.name ? 1 : -1)
        );

        const groupGemsByType = gems =>
          gems
            .map(e => e.type)
            .reduce((list, type, index, array) => {
              if (array.indexOf(type) === index) {
                list.push({
                  type,
                  number: array.filter(t => t === type).length
                });
              }
              return list;
            }, [])
            .sort((a, b) => (a.name > b.name ? 1 : -1));

        user.receivedGems = groupGemsByType(user.receivedGems);
        user.minedGemsList = groupGemsByType(user.minedGemsList);

        res.render('pages/user', { thisUser: user });
      } else {
        next(createError(404));
      }
    })
    .catch(next);
};

exports.getDelete = (req, res, next) => {
  if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.getUser(req.params.id)
      .then(user => {
        if (user) {
          res.render('deleteuser', { user, ref: req.query.ref });
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};

exports.delete = (req, res, next) => {
  if (res.locals.user.master === false) {
    next(createError(403));
  } else {
    db.deleteUser(req.params.id)
      .then(result => {
        if (result) {
          res.redirect(req.body.ref);
        } else {
          next(createError(404));
        }
      })
      .catch(next);
  }
};

exports.update = (req, res, next) => {
  db.updateUser(
    req.params.id,
    req.body.login,
    req.body.password,
    req.body.name,
    res.locals.user.master
      ? req.body.master === 'on'
        ? true
        : false
      : undefined,
    res.locals.user.master
      ? req.body.deleted === 'on'
        ? true
        : false
      : undefined
  )
    .then(result => {
      if (result === true) {
        res.redirect('/users/' + req.params.id);
      } else {
        next(createError(404));
      }
    })
    .catch(next);
};

exports.getAddPreferences = (req, res, next) => {
  const options = { id: req.params.id };
  options.number = parseInt(req.query.number) || 1;

  Promise.all([db.getUser(req.params.id), db.getGemTypes()])
    .then(result => {
      const user = result[0];
      const gemTypes = result[1];

      if (user === null) throw createError(404);

      options.user = user;
      options.gemTypes = gemTypes;
      res.render('preferences', options);
    })
    .catch(next);
};

exports.addPreferences = (req, res, next) => {
  const gemType = req.body.gemtype;
  const priority = req.body.priority;

  const gemTypes = Array.isArray(gemType) ? gemType : [gemType];
  const priorities = Array.isArray(priority) ? priority : [priority];

  const deleted = req.body.deleted || {};

  const preferences = gemTypes
    .filter(gemType => deleted[gemType] !== 'on')
    .map((gemType, key) => {
      return { gemType, priority: parseInt(priorities[key]) };
    });

  db.setFavorites(req.params.id, preferences)
    .then(() => {
      res.redirect('/users/' + req.params.id);
    })
    .catch(next);
};

exports.confirm = (req, res, next) => {
  db.confirmGems(Object.keys(req.body.gem))
    .then(() => {
      res.redirect('/users/' + req.params.id);
    })
    .catch(next);
};
