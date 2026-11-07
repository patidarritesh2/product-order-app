jest.mock('../src/db/mysql', () => ({ pool: { query: jest.fn() }, initSchema: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { jwtSecret } = require('../src/config/env');

const auth = { Authorization: `Bearer ${jwt.sign({ sub: '1', username: 'u' }, jwtSecret)}` };

afterEach(() => jest.restoreAllMocks());

it('maps the Open-Meteo response', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      current: { temperature_2m: 28.4, relative_humidity_2m: 60, wind_speed_10m: 9.1, weather_code: 2, time: 't' },
    }),
  });
  const res = await request(app).get('/api/weather').set(auth);
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ temperature: 28.4, humidity: 60, description: 'Partly cloudy' });
});

it('returns 502 when the upstream API fails', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false });
  const res = await request(app).get('/api/weather').set(auth);
  expect(res.status).toBe(502);
});

it('returns 504 when the upstream API is unreachable', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));
  const res = await request(app).get('/api/weather').set(auth);
  expect(res.status).toBe(504);
});

it('validates coordinates', async () => {
  const res = await request(app).get('/api/weather?lat=999&lon=0').set(auth);
  expect(res.status).toBe(400);
});
