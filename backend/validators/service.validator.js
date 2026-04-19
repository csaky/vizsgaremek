const { body, validationResult } = require('express-validator');

const createRules = [
    body('name')
        .notEmpty().withMessage('A név megadása kötelező')
        .trim()
];

const salonServiceRules = [
    body('service_id')
        .isInt({ min: 1 }).withMessage('A service_id pozitív egész szám kell legyen'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Az ár nem lehet negatív'),
    body('duration_min')
        .isInt({ min: 1 }).withMessage('Az időtartam pozitív egész szám kell legyen')
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

module.exports = { createRules, salonServiceRules, validate };
