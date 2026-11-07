const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/mysql');
const { jwtSecret, jwtExpiresIn, bcryptRounds } = require('../config/env');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', bcryptRounds);

const signToken = (user) =>
  jwt.sign({ sub: String(user.id), username: user.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

exports.register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, bcryptRounds);

  let result;
  try {
    [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hash,
    ]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Username already taken');
    throw err;
  }

  const user = { id: result.insertId, username };
  res.status(201).json({ token: signToken(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id, username, password FROM users WHERE username = ?',
    [username]
  );
  const row = rows[0];
  const ok = await bcrypt.compare(password, row ? row.password : DUMMY_HASH);
  if (!row || !ok) throw new HttpError(401, 'Invalid username or password');

  const user = { id: row.id, username: row.username };
  res.json({ token: signToken(user), user });
});

exports.me = (req, res) => res.json({ user: req.user });
