jest.mock('../src/db/mysql', () => ({ pool: { query: jest.fn() }, initSchema: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const { pool } = require('../src/db/mysql');

beforeEach(() => pool.query.mockReset());

describe('POST /api/auth/register', () => {
  it('creates a user, hashes the password and returns a token', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ritesh', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 1, username: 'ritesh' });
    expect(res.body.token).toBeTruthy();

    const storedHash = pool.query.mock.calls[0][1][1];
    expect(storedHash).not.toBe('secret123');
    expect(await bcrypt.compare('secret123', storedHash)).toBe(true);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'abc', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('password');
  });

  it('returns 409 for a duplicate username', async () => {
    pool.query.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ritesh', password: 'secret123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const hash = await bcrypt.hash('secret123', 4);
    pool.query.mockResolvedValueOnce([[{ id: 7, username: 'ritesh', password: hash }]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ritesh', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(7);
    expect(res.body.token).toBeTruthy();
  });

  it('returns 401 for a wrong password', async () => {
    const hash = await bcrypt.hash('secret123', 4);
    pool.query.mockResolvedValueOnce([[{ id: 7, username: 'ritesh', password: hash }]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ritesh', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown user', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'x' });
    expect(res.status).toBe(401);
  });
});
