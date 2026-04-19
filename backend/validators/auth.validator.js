const { body, validationResult } = require('express-validator');

const registerRules = [
    body('email')
        .isEmail().withMessage('Érvénytelen email formátum')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie'),
    body('full_name')
        .notEmpty().withMessage('A teljes név megadása kötelező')
        .trim(),
    body('role')
        .isIn(['customer', 'barber', 'owner']).withMessage('A szerepkör csak customer, barber vagy owner lehet'),
];

const loginRules = [
    body('email').isEmail().withMessage('Érvénytelen email cím').normalizeEmail(),
    body('password').notEmpty().withMessage('A jelszó megadása kötelező')
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

module.exports = { registerRules, loginRules, validate };
