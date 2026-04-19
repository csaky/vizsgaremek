const request = require('supertest');
const app = require('../server');
const pool = require('../adatbazis');

const ts = Date.now();

const ownerData = {
    email: `svc_owner_${ts}@teszt.hu`,
    password: 'pass123',
    full_name: 'Szolgáltatás Tulajdonos',
    role: 'owner'
};

let ownerToken;
let createdServiceId;

beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(ownerData);
    ownerToken = res.body.token;
});

afterAll(async () => {
    if (createdServiceId) {
        await pool.execute('DELETE FROM services WHERE service_id = ?', [createdServiceId]).catch(() => {});
    }
    await pool.execute('DELETE FROM owners WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)', [ownerData.email]);
    await pool.execute('DELETE FROM users WHERE email = ?', [ownerData.email]);
    await pool.end();
});

describe('GET /api/services', () => {
    it('nyilvánosan visszaadja a szolgáltatások listáját', async () => {
        const res = await request(app).get('/api/services');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /api/services', () => {
    it('tulajdonosként sikeresen létrehoz egy szolgáltatást', async () => {
        const res = await request(app)
            .post('/api/services')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ name: `Teszt Szolgáltatás ${ts}` });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('service_id');
        createdServiceId = res.body.service_id;
    });

    it('bejelentkezés nélkül 401-et ad vissza', async () => {
        const res = await request(app)
            .post('/api/services')
            .send({ name: 'Nem jogos szolgáltatás' });
        expect(res.status).toBe(401);
    });
});
