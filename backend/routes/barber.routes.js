const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/barber.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.get('/salons/:id/barbers',                ctrl.listBarbersBySalon);
router.post('/salons/:id/barbers',               authenticate, requireRole('owner'), ctrl.createBarber);
router.delete('/salons/:id/barbers/:userId',     authenticate, requireRole('owner'), ctrl.removeBarber);
router.get('/barbers/:id/services',              ctrl.listBarberServices);
router.post('/barbers/:id/services',             authenticate, ctrl.addBarberService);

module.exports = router;
