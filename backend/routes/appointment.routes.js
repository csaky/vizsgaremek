const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/appointment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { createRules, validate } = require('../validators/appointment.validator');

router.post('/',                      authenticate, createRules, validate, ctrl.createAppointment);
router.get('/my',                     authenticate, ctrl.myAppointments);
router.get('/barber/:id/slots',       authenticate, ctrl.barberSlots);
router.delete('/:id',                 authenticate, ctrl.cancelAppointment);
router.get('/salon/:id',              authenticate, ctrl.salonAppointments);
router.patch('/:id/status',           authenticate, ctrl.updateAppointmentStatus);

module.exports = router;
