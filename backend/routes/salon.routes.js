const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/salon.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const { salonServiceRules, validate } = require('../validators/service.validator');

router.get('/',    ctrl.listSalons);
router.get('/:id', ctrl.getSalon);
router.post('/',   authenticate, requireRole('owner'), ctrl.createSalon);
router.put('/:id', authenticate, requireRole('owner'), ctrl.updateSalon);

router.get('/:id/services',                    ctrl.getSalonServices);
router.post('/:id/services', authenticate, requireRole('owner'), salonServiceRules, validate, ctrl.addSalonService);
router.delete('/:id/services/:serviceId', authenticate, requireRole('owner'), ctrl.removeSalonService);

module.exports = router;
