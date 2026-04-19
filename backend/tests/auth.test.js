const request = require('supertest');
const app = require('../server');
const pool = require('../adatbazis');

const ts = Date.now();

const customerData = {
    email: `teszt_${ts}@teszt.hu`,
    password: 'pass123',
    full_name: 'Teszt Felhasználó',
    role: 'customer'
};

let token;

afterAll(async () => {
    await pool.execute('DELETE FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)', [customerData.email]);
    await pool.execute('DELETE FROM users WHERE email = ?', [customerData.email]);
    await pool.end();
});

describe('POST /api/auth/register', () => {
    it('sikeresen regisztrál egy új ügyfelet', async () => {
        const res = await request(app).post('/api/auth/register').send(customerData);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('duplikált email esetén 409-et ad vissza', async () => {
        const res = await request(app).post('/api/auth/register').send(customerData);
        expect(res.status).toBe(409);
    });
});

describe('POST /api/auth/login', () => {
    it('helyes adatokkal bejelentkezik', async () => {
        const res = await request(app).post('/api/auth/login')
            .send({ email: customerData.email, password: customerData.password });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('rossz jelszóval 401-et ad vissza', async () => {
        const res = await request(app).post('/api/auth/login')
            .send({ email: customerData.email, password: 'rosszjelszo' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/me', () => {
    it('visszaadja a bejelentkezett felhasználó adatait', async () => {
        const res = await request(app).get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(customerData.email);
    });

    it('token nélkül 401-et ad vissza', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});
