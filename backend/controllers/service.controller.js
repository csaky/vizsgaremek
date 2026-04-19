const pool = require('../adatbazis');

async function listServices(req, res) {
    const [rows] = await pool.execute('SELECT * FROM services ORDER BY name');
    return res.json(rows);
}

async function createService(req, res) {
    const { name } = req.body;
    const [result] = await pool.execute('INSERT INTO services (name) VALUES (?)', [name]);
    return res.status(201).json({ service_id: result.insertId, name });
}

async function updateService(req, res) {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    const [[svc]] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [id]);
    if (!svc) return res.status(404).json({ message: 'A szolgáltatás nem található' });

    await pool.execute('UPDATE services SET name = ? WHERE service_id = ?', [name || svc.name, id]);
    return res.json({ message: 'Szolgáltatás frissítve' });
}

async function deleteService(req, res) {
    const id = parseInt(req.params.id);
    const [result] = await pool.execute('DELETE FROM services WHERE service_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'A szolgáltatás nem található' });
    return res.json({ message: 'Szolgáltatás törölve' });
}

module.exports = { listServices, createService, updateService, deleteService };
