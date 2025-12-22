const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function signAccessToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function signRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken
};
