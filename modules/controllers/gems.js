const db = require('../db');
const createError = require('http-errors');
const assign = require('../assign');

const sortGems = (a, b) =>
  b.mineDate - a.mineDate || (a.type.name > b.type.name ? 1 : -1);

exports.getAdd = (req, res, next) => {
  if (res.locals.user.role === 'elf') {
    return next(createError(403));
  }

  let num = parseInt(req.query.num);

  if (num && num >= 1 && num <= 100) {
    db.getGemTypes()
      .then(gemTypes => {
        res.render('pages/addgems', { num, gemTypes });
      })
      .catch(next);
  } else {
    res.render('pages/addgems');
  }
};

exports.add = (req, res, next) => {
  if (res.locals.user.role === 'elf') {
    return next(createError(403));
  }

  const gemtype = req.body.gemtype;
  const number = req.body.number;

  const types = Array.isArray(gemtype) ? gemtype : [gemtype];
  const gemsNumber = Array.isArray(number) ? number : [number];

  const newGems = types.map((type, index) => {
    return { type, number: parseInt(gemsNumber[index]) };
  });

  db.addGems(newGems, res.locals.user._id)
    .then(() => {
      res.redirect('/');
    })
    .catch(next);
};

exports.getList = (req, res, next) => {
  if (res.locals.user.role === 'elf') {
    return next(createError(403));
  }

  Promise.all([
    db.getGems(req.query),
    db.getUsers(),
    db.getGemTypes(),
    db.getStatuses()
  ])
    .then(result => {
      const gems = result[0].sort(sortGems);
      const users = result[1];
      const gemTypes = result[2];
      const statuses = result[3];

      const elves = users.filter(u => u.role === 'elf');
      const gnomes = users.filter(u => u.role === 'gnome');
      const masters = gnomes.filter(u => u.master === true);
      const statusesMap = statuses.reduce(
        (map, status) => Object.assign(map, { [status._id]: status.name }),
        {}
      );

      res.render('pages/gems', {
        gems,
        elves,
        gnomes,
        masters,
        gemTypes,
        statuses,
        statusesMap,
        query: req.query,
        ref: encodeURIComponent(req.url)
      });
    })
    .catch(next);
};

exports.getDelete = (req, res, next) => {
  if (!res.locals.user.master) {
    return next(createError(403));
  }

  Promise.all([db.getGem(req.params.id), db.getStatuses()])
    .then(result => {
      const gem = result[0];
      const statuses = result[1];

      const statusesMap = statuses.reduce(
        (map, status) => Object.assign(map, { [status._id]: status.name }),
        {}
      );

      res.render('deletegem', { gem, statusesMap, ref: req.query.ref });
    })
    .catch(next);
};

exports.delete = (req, res, next) => {
  if (!res.locals.user.master) {
    return next(createError(403));
  }

  db.deleteGem(req.params.id)
    .then(result => {
      if (result) {
        res.redirect(req.body.ref);
      } else {
        next(createError(404));
      }
    })
    .catch(next);
};

exports.assign = (req, res, next) => {
  if (!res.locals.user.master) {
    return next(createError(403));
  }

  const options = {};

  Promise.all([
    db.getGems({ status: 'not assigned' }),
    db.getUsers({ role: 'elf' }, true)
  ])
    .then(result => {
      options.gems = result[0];
      options.elves = result[1];

      if (req.query.auto) {
        return db.getSettings().then(settings => {
          const elvesForAssignment = options.elves.map(elf => {
            const priorSum = elf.favorites.reduce(
              (sum, fav) => sum + fav.priority,
              0
            );

            const favorites = elf.favorites.reduce(
              (obj, e) =>
                Object.assign(obj, { [e.gemType._id]: e.priority / priorSum }),
              {}
            );

            return {
              id: elf._id,
              gems: elf.hasGems,
              favorites,
              ref: elf
            };
          });

          const stash = options.gems.map(gem => ({
            id: gem._id,
            type: gem.type._id,
            ref: gem
          }));

          const coefSum = settings.c1 + settings.c2 + settings.c3;
          const c1 = settings.c1 / coefSum;
          const c2 = settings.c2 / coefSum;
          const c3 = settings.c3 / coefSum;

          const assignment = assign(elvesForAssignment, stash, c1, c2, c3);

          assignment.forEach(e => {
            e.gem.ref.assignedTo = e.elf.ref;
          });

          options.auto = true;
        });
      }
    })
    .then(() => {
      options.gems.sort(sortGems);
      res.render('pages/assign', options);
    })
    .catch(next);
};

exports.confirmAssignment = (req, res, next) => {
  if (!res.locals.user.master) {
    return next(createError(403));
  }

  const gem = req.body.gem;
  const owner = req.body.owner;
  const assigned = req.body.assigned;

  const gems = Array.isArray(gem) ? gem : [gem];
  const owners = Array.isArray(owner) ? owner : [owner];
  const assignedArray = Array.isArray(assigned) ? assigned : [assigned];

  const assignment = gems.map((gem, index) => ({
    gem,
    owner: owners[index],
    manualAssignment: owners[index] !== assignedArray[index]
  }));

  db.assignGems(assignment, res.locals.user._id)
    .then(() => {
      res.redirect('/gems');
    })
    .catch(next);
};
