const bcrypt              = require('bcryptjs');
const jwt                 = require('jsonwebtoken');
const pool                = require('../adatbazis');
const { sendWelcomeEmail } = require('../config/mailer');

async function getUserRoles(conn, userId) {
    const roles = [];
    const [[cust]] = await conn.execute('SELECT 1 FROM customers WHERE user_id = ?', [userId]);
    const [[barb]] = await conn.execute('SELECT 1 FROM barbers WHERE user_id = ?', [userId]);
    const [[own]] = await conn.execute('SELECT 1 FROM owners WHERE user_id = ?', [userId]);
    if (cust) roles.push('customer');
    if (barb) roles.push('barber');
    if (own)  roles.push('owner');
    return roles;
}

async function register(req, res) {
    const { email, password, full_name, phone, role, salon_id } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[existing]] = await conn.execute('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing) {
            await conn.rollback();
            return res.status(409).json({ message: 'Ez az email cím már foglalt' });
        }

        const hash = await bcrypt.hash(password, 10);

        const [result] = await conn.execute(
            'INSERT INTO users (email, full_name, password, phone) VALUES (?, ?, ?, ?)',
            [email, full_name, hash, phone || null]
        );
        const userId = result.insertId;

        // Altípus tábla feltöltés
        if (role === 'customer') {
            await conn.execute('INSERT INTO customers (user_id) VALUES (?)', [userId]);
        } else if (role === 'owner') {
            await conn.execute('INSERT INTO owners (user_id) VALUES (?)', [userId]);
        } else if (role === 'barber') {
            if (!salon_id) {
                await conn.rollback();
                return res.status(422).json({ message: 'Borbélyoknál a salon_id megadása kötelező' });
            }
            const [[salon]] = await conn.execute('SELECT salon_id FROM salons WHERE salon_id = ?', [salon_id]);
            if (!salon) {
                await conn.rollback();
                return res.status(422).json({ message: 'A szalon nem található' });
            }
            await conn.execute('INSERT INTO barbers (user_id, salon_id) VALUES (?, ?)', [userId, salon_id]);
        }

        await conn.commit();

        await sendWelcomeEmail(email, full_name);

        const roles = await getUserRoles(conn, userId);
        const token = jwt.sign(
            { user_id: userId, email, roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.status(201).json({ token, user: { user_id: userId, email, full_name, roles } });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ message: 'Hiba a regisztráció során' });
    } finally {
        conn.release();
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    const [[user]] = await pool.execute(
        'SELECT user_id, email, full_name, password FROM users WHERE email = ?',
        [email]
    );
    if (!user) return res.status(401).json({ message: 'Hibás email cím vagy jelszó' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)  return res.status(401).json({ message: 'Hibás email cím vagy jelszó' });

    const conn = await pool.getConnection();
    try {
        const roles = await getUserRoles(conn, user.user_id);
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, roles },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.json({
            token,
            user: { user_id: user.user_id, email: user.email, full_name: user.full_name, roles }
        });
    } finally {
        conn.release();
    }
}

async function me(req, res) {
    const [[user]] = await pool.execute(
        'SELECT user_id, email, full_name, phone, created_at FROM users WHERE user_id = ?',
        [req.user.user_id]
    );
    if (!user) return res.status(404).json({ message: 'A felhasználó nem található' });

    return res.json({ ...user, roles: req.user.roles });
}

module.exports = { register, login, me };
