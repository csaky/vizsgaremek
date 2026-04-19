const { body, validationResult } = require('express-validator');

const createRules = [
    body('barber_id')
        .isInt({ min: 1 }).withMessage('A barber_id pozitív egész szám kell legyen'),
    body('salon_id')
        .isInt({ min: 1 }).withMessage('A salon_id pozitív egész szám kell legyen'),
    body('start_at')
        .isISO8601().withMessage('A start_at érvényes ISO 8601 dátum kell legyen'),
    body('service_ids')
        .isArray({ min: 1 }).withMessage('A service_ids nem lehet üres tömb'),
    body('service_ids.*')
        .isInt({ min: 1 }).withMessage('Minden service_id pozitív egész szám kell legyen')
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

module.exports = { createRules, validate };
