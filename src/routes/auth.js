const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const {
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_TTL_DAYS
} = require('../utils/tokens');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await db.query(
    'SELECT id, email, password_hash, role FROM users WHERE email=$1',
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, now() + interval '${REFRESH_TOKEN_TTL_DAYS} days')`,
    [user.id, refreshToken]
  );

  res
    .cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false // true in production with HTTPS
    })
    .json({ accessToken });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const { rows } = await db.query(
      `SELECT * FROM refresh_tokens
       WHERE token=$1 AND expires_at > now()`,
      [token]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const userRes = await db.query(
      'SELECT id, role FROM users WHERE id=$1',
      [payload.id]
    );

    const user = userRes.rows[0];
    const newAccessToken = signAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token;

  if (token) {
    await db.query(
      'DELETE FROM refresh_tokens WHERE token=$1',
      [token]
    );
  }

  res
    .clearCookie('refresh_token')
    .json({ message: 'Logged out' });
});


module.exports = router;
