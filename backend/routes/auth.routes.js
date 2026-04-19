const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', registerRules, validate, ctrl.register);
router.post('/login',    loginRules,    validate, ctrl.login);
router.get('/me',        authenticate,            ctrl.me);

module.exports = router;
