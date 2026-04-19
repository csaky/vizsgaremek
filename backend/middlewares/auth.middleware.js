const jwt  = require('jsonwebtoken');

async function authenticate(req, res, next) {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Nincs megadva token' });
    }

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: 'Érvénytelen vagy lejárt token' });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Nincs bejelentkezve' });
        if (!req.user.roles?.includes(role)) {
            return res.status(403).json({ message: 'Hozzáférés megtagadva: nincs megfelelő jogosultság' });
        }
        next();
    };
}

module.exports = { authenticate, requireRole };
