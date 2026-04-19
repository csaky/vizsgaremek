const bcrypt = require('bcryptjs');
const pool = require('../adatbazis');

async function listBarbersBySalon(req, res) {
    const salonId = parseInt(req.params.id);

    const [barbers] = await pool.execute(
        `SELECT b.user_id AS barber_id, u.full_name, b.ratings
         FROM barbers b
         JOIN users u ON u.user_id = b.user_id
         WHERE b.salon_id = ?`,
        [salonId]
    );
    return res.json(barbers);
}

async function listBarberServices(req, res) {
    const barberId = parseInt(req.params.id);

    const [services] = await pool.execute(
        `SELECT sv.service_id, sv.name
         FROM barber_services bs
         JOIN services sv ON sv.service_id = bs.service_id
         WHERE bs.barber_user_id = ?`,
        [barberId]
    );
    return res.json(services);
}

async function addBarberService(req, res) {
    const barberId = parseInt(req.params.id);
    const { service_id } = req.body;

    if (req.user.user_id !== barberId) {
        return res.status(403).json({ message: 'Csak a saját szolgáltatásaidat módosíthatod' });
    }

    const [[barber]] = await pool.execute('SELECT 1 FROM barbers WHERE user_id = ?', [barberId]);
    if (!barber) return res.status(404).json({ message: 'A borbély nem található' });

    const [[svc]] = await pool.execute('SELECT 1 FROM services WHERE service_id = ?', [service_id]);
    if (!svc) return res.status(404).json({ message: 'A szolgáltatás nem található' });

    await pool.execute(
        'INSERT IGNORE INTO barber_services (barber_user_id, service_id) VALUES (?, ?)',
        [barberId, service_id]
    );
    return res.status(201).json({ message: 'Szolgáltatás hozzáadva a borbélyhoz' });
}

async function createBarber(req, res) {
    const salonId = parseInt(req.params.id);
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'full_name, email és password megadása kötelező' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Ellenőrzés: a szalon az ownerhez tartozik-e
        const [[salon]] = await conn.execute(
            'SELECT salon_id FROM salons WHERE salon_id = ? AND owner_id = ?',
            [salonId, req.user.user_id]
        );
        if (!salon) {
            await conn.rollback();
            return res.status(403).json({ message: 'Nincs jogod ehhez a szalonhoz' });
        }

        const [[existing]] = await conn.execute('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing) {
            await conn.rollback();
            return res.status(409).json({ message: 'Ez az email már foglalt' });
        }

        const hash = await bcrypt.hash(password, 10);
        const [result] = await conn.execute(
            'INSERT INTO users (email, full_name, password, phone) VALUES (?, ?, ?, ?)',
            [email, full_name, hash, phone || null]
        );
        const userId = result.insertId;

        await conn.execute('INSERT INTO barbers (user_id, salon_id) VALUES (?, ?)', [userId, salonId]);

        await conn.commit();
        return res.status(201).json({ message: 'Borbély sikeresen létrehozva', user_id: userId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ message: 'Hiba a borbély létrehozásakor' });
    } finally {
        conn.release();
    }
}

async function removeBarber(req, res) {
    const salonId = parseInt(req.params.id);
    const barberId = parseInt(req.params.userId);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Ellenőrzés: a szalon az ownerhez tartozik-e
        const [[salon]] = await conn.execute(
            'SELECT salon_id FROM salons WHERE salon_id = ? AND owner_id = ?',
            [salonId, req.user.user_id]
        );
        if (!salon) {
            await conn.rollback();
            return res.status(403).json({ message: 'Nincs jogod ehhez a szalonhoz' });
        }

        // Ellenőrzés: a borbély ehhez a szalonhoz tartozik-e
        const [[barber]] = await conn.execute(
            'SELECT user_id FROM barbers WHERE user_id = ? AND salon_id = ?',
            [barberId, salonId]
        );
        if (!barber) {
            await conn.rollback();
            return res.status(404).json({ message: 'Borbély nem található ebben a szalonban' });
        }

        await conn.execute('DELETE FROM barbers WHERE user_id = ? AND salon_id = ?', [barberId, salonId]);
        await conn.execute('DELETE FROM users WHERE user_id = ?', [barberId]);

        await conn.commit();
        return res.json({ message: 'Borbély eltávolítva' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ message: 'Hiba a borbély eltávolításakor' });
    } finally {
        conn.release();
    }
}

module.exports = { listBarbersBySalon, listBarberServices, addBarberService, createBarber, removeBarber };
