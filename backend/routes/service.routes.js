const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/service.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const { createRules, validate } = require('../validators/service.validator');

router.get('/',     ctrl.listServices);
router.post('/',    authenticate, requireRole('owner'), createRules, validate, ctrl.createService);
router.put('/:id',  authenticate, requireRole('owner'), createRules, validate, ctrl.updateService);
router.delete('/:id', authenticate, requireRole('owner'), ctrl.deleteService);

module.exports = router;
