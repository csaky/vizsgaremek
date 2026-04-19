const request = require('supertest');
const app     = require('../server');
const pool    = require('../adatbazis');

afterAll(async () => {
    await pool.end();
});

describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});
