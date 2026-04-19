const request = require('supertest');
const app = require('../server');
const pool = require('../adatbazis');

const ts = Date.now();

const ownerData = {
    email: `owner_${ts}@teszt.hu`,
    password: 'pass123',
    full_name: 'Teszt Tulajdonos',
    role: 'owner'
};

let ownerToken;
let salonId;

beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(ownerData);
    ownerToken = res.body.token;
});

afterAll(async () => {
    if (salonId) await pool.execute('DELETE FROM salons WHERE salon_id = ?', [salonId]);
    await pool.execute('DELETE FROM owners WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)', [ownerData.email]);
    await pool.execute('DELETE FROM users WHERE email = ?', [ownerData.email]);
    await pool.end();
});

describe('GET /api/salons', () => {
    it('nyilvánosan visszaadja a szalonok listáját', async () => {
        const res = await request(app).get('/api/salons');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /api/salons', () => {
    it('tulajdonosként sikeresen létrehoz egy szalont', async () => {
        const res = await request(app)
            .post('/api/salons')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ name: `Teszt Szalon ${ts}`, address: 'Teszt utca 1.' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('salon_id');
        salonId = res.body.salon_id;
    });

    it('bejelentkezés nélkül 401-et ad vissza', async () => {
        const res = await request(app)
            .post('/api/salons')
            .send({ name: 'Nem jogos szalon', address: 'Valahol' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/salons/:id', () => {
    it('visszaadja a szalon részleteit', async () => {
        const res = await request(app).get(`/api/salons/${salonId}`);
        expect(res.status).toBe(200);
        expect(res.body.salon_id).toBe(salonId);
    });

    it('nem létező szalonra 404-et ad vissza', async () => {
        const res = await request(app).get('/api/salons/999999');
        expect(res.status).toBe(404);
    });
});
