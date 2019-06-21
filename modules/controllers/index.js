exports.getMainPage = (req, res) => {
  if (res.locals.user.master) {
    res.redirect('/gems');
  } else if (res.locals.user.role === 'elf') {
    res.redirect('/users/' + res.locals.user._id);
  } else if (res.locals.user.role === 'gnome') {
    res.redirect('/gems/add');
  }
};

exports.middleware = require('./middleware');
exports.init = require('./init');
exports.login = require('./login');
exports.users = require('./users');
exports.settings = require('./settings');
exports.gemtypes = require('./gemtypes');
exports.gems = require('./gems');
