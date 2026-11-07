const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const HttpError = require('../utils/httpError');

module.exports = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Authentication required'));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: Number(payload.sub), username: payload.username };
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};
