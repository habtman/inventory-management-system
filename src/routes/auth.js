const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const {
  signAccessToken,
  signRefreshToken,
  REFRESH_TOKEN_TTL_DAYS
} = require('../utils/tokens');

const router = express.Router();

/**
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

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
        secure: true,          // REQUIRED for Fly.io
        sameSite: 'none',      // REQUIRED for cross-site (localhost → fly.dev)
        path: '/'
      })
      .json({ accessToken });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const { rows } = await db.query(
      `SELECT id FROM refresh_tokens
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

    if (!userRes.rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = signAccessToken(userRes.rows[0]);

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;

    if (token) {
      await db.query(
        'DELETE FROM refresh_tokens WHERE token=$1',
        [token]
      );
    }

    res
      .clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      })
      .json({ message: 'Logged out' });

  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
