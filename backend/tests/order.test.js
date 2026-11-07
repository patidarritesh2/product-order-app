jest.mock('../src/db/mysql', () => ({ pool: { query: jest.fn() }, initSchema: jest.fn() }));
jest.mock('../src/models/product.model', () => ({ find: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/db/mysql');
const Product = require('../src/models/product.model');
const { jwtSecret } = require('../src/config/env');

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const token = jwt.sign({ sub: '1', username: 'ritesh' }, jwtSecret);
const auth = { Authorization: `Bearer ${token}` };
const row = (over = {}) => ({
  order_id: 5, user_id: 1, product_ids: [A, B], total_amount: '30.50',
  created_at: '2026-01-01', updated_at: '2026-01-01', ...over,
});

beforeEach(() => {
  pool.query.mockReset();
  Product.find.mockReset();
});

describe('orders API', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/orders/5');
    expect(res.status).toBe(401);
  });

  it('creates an order and computes the total from product prices', async () => {
    Product.find.mockResolvedValue([{ _id: A, price: 10 }, { _id: B, price: 20.5 }]);
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]).mockResolvedValueOnce([[row()]]);

    const res = await request(app).post('/api/orders').set(auth).send({ productIds: [A, B] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ orderId: 5, userId: 1, productIds: [A, B], totalAmount: 30.5 });
    expect(pool.query.mock.calls[0][1]).toEqual([1, JSON.stringify([A, B]), 30.5]);
  });

  it('rejects unknown products with 400', async () => {
    Product.find.mockResolvedValue([{ _id: A, price: 10 }]);
    const res = await request(app).post('/api/orders').set(auth).send({ productIds: [A, B] });
    expect(res.status).toBe(400);
  });

  it('rejects an empty productIds array with 400', async () => {
    const res = await request(app).post('/api/orders').set(auth).send({ productIds: [] });
    expect(res.status).toBe(400);
  });

  it('returns 404 for an order that is not found / not yours', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/orders/99').set(auth);
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-numeric order id', async () => {
    const res = await request(app).get('/api/orders/abc').set(auth);
    expect(res.status).toBe(400);
  });

  it('deletes an order', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/orders/5').set(auth);
    expect(res.status).toBe(204);
  });
});
