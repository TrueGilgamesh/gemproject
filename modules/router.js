const express = require('express');
const controllers = require('./controllers');

const router = express.Router();

router.get('/init', controllers.init.get);
router.post('/init', controllers.init.post);

router.use(controllers.middleware.checkInit);

router.get('/login', controllers.login.get);
router.post('/login', controllers.login.post);

router.use(controllers.middleware.checkLogin);

router.get('/logout', controllers.login.logout);

router.get('/', controllers.getMainPage);

router.get('/users', controllers.users.getList);
router.get('/users/create', controllers.users.getCreate);
router.post('/users/create', controllers.users.create);
router.get('/users/:id', controllers.users.get);
router.get('/users/:id/delete', controllers.users.getDelete);
router.post('/users/:id/delete', controllers.users.delete);
router.post('/users/:id/update', controllers.users.update);
router.get('/users/:id/preferences/add', controllers.users.getAddPreferences);
router.post('/users/:id/preferences/add', controllers.users.addPreferences);
router.post('/users/:id/confirm', controllers.users.confirm);

router.get('/settings', controllers.settings.get);
router.post('/settings', controllers.settings.post);

router.get('/gemtypes/add', controllers.gemtypes.getAdd);
router.post('/gemtypes/add', controllers.gemtypes.add);
router.get('/gemtypes/:id/delete', controllers.gemtypes.getDelete);
router.post('/gemtypes/:id/delete', controllers.gemtypes.delete);
router.get('/gemtypes/:id/edit', controllers.gemtypes.getEdit);
router.post('/gemtypes/:id/edit', controllers.gemtypes.edit);

router.get('/gems', controllers.gems.getList);
router.get('/gems/add', controllers.gems.getAdd);
router.post('/gems/add', controllers.gems.add);
router.get('/gems/:id/delete', controllers.gems.getDelete);
router.post('/gems/:id/delete', controllers.gems.delete);
router.get('/gems/assign', controllers.gems.assign);
router.post('/gems/assign', controllers.gems.confirmAssignment);

module.exports = router;
