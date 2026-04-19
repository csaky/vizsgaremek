const pool = require('../adatbazis');

async function createAppointment(req, res) {
    const customerId = req.user.user_id;
    const { barber_id, salon_id, start_at, service_ids } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[cust]] = await conn.execute('SELECT 1 FROM customers WHERE user_id = ?', [customerId]);
        if (!cust) {
            await conn.rollback();
            return res.status(403).json({ message: 'Csak ügyfelek foglalhatnak időpontot' });
        }

        const [[barber]] = await conn.execute(
            'SELECT * FROM barbers WHERE user_id = ? AND salon_id = ?',
            [barber_id, salon_id]
        );
        if (!barber) {
            await conn.rollback();
            return res.status(422).json({ message: 'A borbély nem dolgozik ebben a szalonban' });
        }

        if (!service_ids || service_ids.length === 0) {
            await conn.rollback();
            return res.status(422).json({ message: 'Legalább egy szolgáltatást meg kell adni' });
        }

        // 4) Minden service elérhető a szalonban ÉS a barber tudja?
        let totalDuration = 0;
        const serviceDetails = [];

        for (const sid of service_ids) {
            const [[ss]] = await conn.execute(
                'SELECT * FROM salon_services WHERE salon_id = ? AND service_id = ?',
                [salon_id, sid]
            );
            if (!ss) {
                await conn.rollback();
                return res.status(422).json({ message: `A(z) ${sid} szolgáltatást ez a szalon nem kínálja` });
            }

            const [[bs]] = await conn.execute(
                'SELECT 1 FROM barber_services WHERE barber_user_id = ? AND service_id = ?',
                [barber_id, sid]
            );
            if (!bs) {
                await conn.rollback();
                return res.status(422).json({ message: `A borbély nem végzi a(z) ${sid} szolgáltatást` });
            }

            totalDuration += ss.duration_min;
            serviceDetails.push({ service_id: sid, price: ss.price, duration_min: ss.duration_min });
        }

        // 5) Ütköző időpont ellenőrzés (barber)
        const startDt = new Date(start_at);
        const endDt = new Date(startDt.getTime() + totalDuration * 60 * 1000);
        const startStr = startDt.toISOString().slice(0, 19).replace('T', ' ');
        const endStr = endDt.toISOString().slice(0, 19).replace('T', ' ');

        const [conflicts] = await conn.execute(
            `SELECT appointment_id FROM appointments
             WHERE barber_id = ?
               AND status NOT IN ('cancelled')
               AND start_at < ?
               AND DATE_ADD(start_at, INTERVAL duration MINUTE) > ?`,
            [barber_id, endStr, startStr]
        );
        if (conflicts.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: 'A borbélynak ütköző foglalása van' });
        }

        const [apptResult] = await conn.execute(
            `INSERT INTO appointments (customer_id, barber_id, salon_id, start_at, duration, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [customerId, barber_id, salon_id, startStr, totalDuration]
        );
        const appointmentId = apptResult.insertId;

        for (const sd of serviceDetails) {
            await conn.execute(
                `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking, duration_at_booking)
                 VALUES (?, ?, ?, ?)`,
                [appointmentId, sd.service_id, sd.price, sd.duration_min]
            );
        }

        await conn.commit();

        return res.status(201).json({
            appointment_id: appointmentId,
            start_at: startStr,
            duration: totalDuration,
            status: 'pending'
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ message: 'Hiba a foglalás létrehozásakor' });
    } finally {
        conn.release();
    }
}

async function myAppointments(req, res) {
    const userId = req.user.user_id;
    const roles = req.user.roles || [];

    let rows;
    if (roles.includes('customer')) {
        [rows] = await pool.execute(
            `SELECT a.appointment_id, a.start_at, a.duration, a.status,
                    s.name AS salon_name, u.full_name AS barber_name,
                    GROUP_CONCAT(sv.name ORDER BY sv.name SEPARATOR ', ') AS services
             FROM appointments a
             JOIN salons s ON s.salon_id = a.salon_id
             JOIN barbers b ON b.user_id = a.barber_id
             JOIN users u ON u.user_id = b.user_id
             JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
             JOIN services sv ON sv.service_id = aps.service_id
             WHERE a.customer_id = ?
             GROUP BY a.appointment_id
             ORDER BY a.start_at DESC`,
            [userId]
        );
    } else if (roles.includes('barber')) {
        [rows] = await pool.execute(
            `SELECT a.appointment_id, a.start_at, a.duration, a.status,
                    s.name AS salon_name, uc.full_name AS customer_name,
                    GROUP_CONCAT(sv.name ORDER BY sv.name SEPARATOR ', ') AS services
             FROM appointments a
             JOIN salons s ON s.salon_id = a.salon_id
             JOIN customers c ON c.user_id = a.customer_id
             JOIN users uc ON uc.user_id = c.user_id
             JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
             JOIN services sv ON sv.service_id = aps.service_id
             WHERE a.barber_id = ?
             GROUP BY a.appointment_id
             ORDER BY a.start_at DESC`,
            [userId]
        );
    } else {
        return res.status(403).json({ message: 'Csak ügyfelek és borbélyok tekinthetik meg a foglalásokat' });
    }

    return res.json(rows);
}

async function cancelAppointment(req, res) {
    const apptId = parseInt(req.params.id);
    const userId = req.user.user_id;

    const [[appt]] = await pool.execute(
        'SELECT * FROM appointments WHERE appointment_id = ?',
        [apptId]
    );
    if (!appt) return res.status(404).json({ message: 'A foglalás nem található' });

    if (appt.customer_id !== userId) {
        return res.status(403).json({ message: 'Csak saját foglalást mondhatsz le' });
    }
    if (appt.status === 'cancelled') {
        return res.status(409).json({ message: 'Már le van mondva' });
    }

    await pool.execute(
        "UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?",
        [apptId]
    );
    return res.json({ message: 'Foglalás lemondva' });
}

async function salonAppointments(req, res) {
    const salonId = parseInt(req.params.id);
    const userId = req.user.user_id;

    // Owner-e ennek a szalonnak?
    const [[salon]] = await pool.execute(
        'SELECT 1 FROM salons WHERE salon_id = ? AND owner_id = ?',
        [salonId, userId]
    );
    if (!salon) return res.status(403).json({ message: 'Ez nem a te szalonod' });

    const [rows] = await pool.execute(
        `SELECT a.appointment_id, a.start_at, a.duration, a.status,
                uc.full_name AS customer_name, ub.full_name AS barber_name,
                GROUP_CONCAT(sv.name ORDER BY sv.name SEPARATOR ', ') AS services
         FROM appointments a
         JOIN customers cu ON cu.user_id = a.customer_id
         JOIN users uc ON uc.user_id = cu.user_id
         JOIN barbers br ON br.user_id = a.barber_id
         JOIN users ub ON ub.user_id = br.user_id
         JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
         JOIN services sv ON sv.service_id = aps.service_id
         WHERE a.salon_id = ?
         GROUP BY a.appointment_id
         ORDER BY a.start_at DESC`,
        [salonId]
    );
    return res.json(rows);
}

async function updateAppointmentStatus(req, res) {
    const apptId = parseInt(req.params.id);
    const userId = req.user.user_id;
    const { status } = req.body;

    const ALLOWED = ['completed', 'no_show', 'cancelled'];
    if (!ALLOWED.includes(status)) {
        return res.status(422).json({ message: `Az állapot csak a következő lehet: ${ALLOWED.join(', ')}` });
    }

    try {
        const [[appt]] = await pool.execute(
            'SELECT * FROM appointments WHERE appointment_id = ?',
            [apptId]
        );
        if (!appt) return res.status(404).json({ message: 'A foglalás nem található' });

        if (appt.barber_id !== userId) {
            return res.status(403).json({ message: 'Csak a kijelölt borbély módosíthatja ezt a foglalást' });
        }

        if (['cancelled', 'completed', 'no_show'].includes(appt.status)) {
            return res.status(409).json({ message: 'A foglalás már lezárva' });
        }

        await pool.execute(
            'UPDATE appointments SET status = ? WHERE appointment_id = ?',
            [status, apptId]
        );
        return res.json({ message: 'Állapot frissítve', status });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Hiba az állapot frissítésekor' });
    }
}

// Visszaadja a barber nem-törölt foglalásait (start_at, duration)
// egy adott időablakban. Bármely bejelentkezett felhasználó lekérdezheti.
async function barberSlots(req, res) {
    const barberId = parseInt(req.params.id);
    if (isNaN(barberId)) return res.status(400).json({ message: 'Érvénytelen borbély azonosító' });

    const { from, to } = req.query;

    const fromDt = from ? new Date(from) : new Date();
    const toDt = to ? new Date(to) : new Date(fromDt.getTime() + 28 * 24 * 60 * 60 * 1000);

    if (isNaN(fromDt) || isNaN(toDt)) {
        return res.status(400).json({ message: 'Érvénytelen dátum tartomány' });
    }

    const fromStr = fromDt.toISOString().slice(0, 19).replace('T', ' ');
    const toStr = toDt.toISOString().slice(0, 19).replace('T', ' ');

    try {
        const [rows] = await pool.execute(
            `SELECT start_at, duration
             FROM appointments
             WHERE barber_id = ?
               AND status NOT IN ('cancelled')
               AND start_at >= ?
               AND start_at < ?
             ORDER BY start_at`,
            [barberId, fromStr, toStr]
        );
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Hiba a borbély időpontjainak lekérésekor' });
    }
}

module.exports = { createAppointment, myAppointments, cancelAppointment, salonAppointments, updateAppointmentStatus, barberSlots };
