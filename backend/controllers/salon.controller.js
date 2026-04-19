const pool = require('../adatbazis');

async function listSalons(req, res) {
    const [salons] = await pool.execute(
        `SELECT s.salon_id, s.name, s.address, s.phone,
                u.full_name AS owner_name
         FROM salons s
         JOIN owners o ON o.user_id = s.owner_id
         JOIN users u ON u.user_id = o.user_id
         ORDER BY s.name`
    );
    return res.json(salons);
}

async function getSalon(req, res) {
    const id = parseInt(req.params.id);

    const [[salon]] = await pool.execute(
        `SELECT s.salon_id, s.name, s.address, s.phone,
                u.full_name AS owner_name
         FROM salons s
         JOIN owners o ON o.user_id = s.owner_id
         JOIN users u ON u.user_id = o.user_id
         WHERE s.salon_id = ?`,
        [id]
    );
    if (!salon) return res.status(404).json({ message: 'A szalon nem található' });

    // Szolgáltatások
    const [services] = await pool.execute(
        `SELECT sv.service_id, sv.name, ss.price, ss.duration_min
         FROM salon_services ss
         JOIN services sv ON sv.service_id = ss.service_id
         WHERE ss.salon_id = ?`,
        [id]
    );

    // Borbélyok
    const [barbers] = await pool.execute(
        `SELECT b.user_id AS barber_id, u.full_name, b.ratings
         FROM barbers b
         JOIN users u ON u.user_id = b.user_id
         WHERE b.salon_id = ?`,
        [id]
    );

    return res.json({ ...salon, services, barbers });
}

async function createSalon(req, res) {
    const ownerId = req.user.user_id;
    const { name, address, phone } = req.body;

    if (!name || !address) {
        return res.status(422).json({ message: 'A név és a cím megadása kötelező' });
    }

    const [[owner]] = await pool.execute('SELECT 1 FROM owners WHERE user_id = ?', [ownerId]);
    if (!owner) return res.status(403).json({ message: 'Csak tulajdonosok hozhatnak létre szalont' });

    const [result] = await pool.execute(
        'INSERT INTO salons (owner_id, name, address, phone) VALUES (?, ?, ?, ?)',
        [ownerId, name, address, phone || null]
    );

    return res.status(201).json({ salon_id: result.insertId, name, address, phone });
}

async function updateSalon(req, res) {
    const id = parseInt(req.params.id);
    const ownerId = req.user.user_id;
    const { name, address, phone } = req.body;

    const [[salon]] = await pool.execute(
        'SELECT * FROM salons WHERE salon_id = ? AND owner_id = ?',
        [id, ownerId]
    );
    if (!salon) return res.status(404).json({ message: 'A szalon nem található vagy nem a tiéd' });

    await pool.execute(
        'UPDATE salons SET name = ?, address = ?, phone = ? WHERE salon_id = ?',
        [name || salon.name, address || salon.address, phone ?? salon.phone, id]
    );

    return res.json({ message: 'Szalon frissítve' });
}

async function getSalonServices(req, res) {
    const salonId = parseInt(req.params.id);
    const [rows] = await pool.execute(
        `SELECT sv.service_id, sv.name, ss.price, ss.duration_min
         FROM salon_services ss
         JOIN services sv ON sv.service_id = ss.service_id
         WHERE ss.salon_id = ?
         ORDER BY sv.name`,
        [salonId]
    );
    return res.json(rows);
}

async function addSalonService(req, res) {
    const salonId = parseInt(req.params.id);
    const ownerId = req.user.user_id;
    const { service_id, price, duration_min } = req.body;

    const [[salon]] = await pool.execute(
        'SELECT * FROM salons WHERE salon_id = ? AND owner_id = ?',
        [salonId, ownerId]
    );
    if (!salon) return res.status(404).json({ message: 'A szalon nem található vagy nem a tiéd' });

    const [[existing]] = await pool.execute(
        'SELECT 1 FROM salon_services WHERE salon_id = ? AND service_id = ?',
        [salonId, service_id]
    );
    if (existing) return res.status(409).json({ message: 'Ez a szolgáltatás már hozzá van adva ehhez a szalonhoz' });

    await pool.execute(
        'INSERT INTO salon_services (salon_id, service_id, price, duration_min) VALUES (?, ?, ?, ?)',
        [salonId, service_id, price, duration_min]
    );
    return res.status(201).json({ message: 'Szolgáltatás hozzáadva a szalonhoz' });
}

async function removeSalonService(req, res) {
    const salonId = parseInt(req.params.id);
    const serviceId = parseInt(req.params.serviceId);
    const ownerId = req.user.user_id;

    const [[salon]] = await pool.execute(
        'SELECT * FROM salons WHERE salon_id = ? AND owner_id = ?',
        [salonId, ownerId]
    );
    if (!salon) return res.status(404).json({ message: 'A szalon nem található vagy nem a tiéd' });

    const [result] = await pool.execute(
        'DELETE FROM salon_services WHERE salon_id = ? AND service_id = ?',
        [salonId, serviceId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'A szolgáltatás nem található ebben a szalonban' });
    return res.json({ message: 'Szolgáltatás eltávolítva a szalonból' });
}

module.exports = { listSalons, getSalon, createSalon, updateSalon, getSalonServices, addSalonService, removeSalonService };
