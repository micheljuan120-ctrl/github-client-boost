const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

// Rota de Registro
const { sendVerificationEmail } = require('../config/mailer');

// Rota de Registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Gera código de 6 dígitos
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_code, verification_code_expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [username, email, hashedPassword, verificationCode, verificationCodeExpiresAt]
    );

    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (emailResult.success) {
      res.status(201).json({ 
        message: 'Registration successful. A verification code has been sent to your email.',
        previewUrl: emailResult.previewUrl // Apenas para teste com Ethereal
      });
    } else {
      // Mesmo que o e-mail falhe, o usuário foi criado. Podemos lidar com isso depois.
      res.status(201).json({ message: 'Registration successful, but failed to send verification email. Please contact support.' });
    }

  } catch (error) {
    if (error.code === '23505') { // Código de erro do PostgreSQL para violação de unicidade
      if (error.constraint === 'users_username_key' || error.detail.includes('username')) {
        return res.status(409).json({ message: 'Username already exists. Please choose another one.' });
      } else if (error.constraint === 'users_email_unique' || error.detail.includes('email')) {
        return res.status(409).json({ message: 'Email already registered. Please use another one.' });
      }
    }
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota para Verificar o E-mail
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verification_code !== code || new Date() > new Date(user.verification_code_expires_at)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    await pool.query(
      'UPDATE users SET is_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota para Reenviar o Código de Verificação
router.post('/resend-verification-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newVerificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

    await pool.query(
      'UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3',
      [newVerificationCode, newVerificationCodeExpiresAt, user.id]
    );

    const emailResult = await sendVerificationEmail(email, newVerificationCode);

    if (emailResult.success) {
      res.status(200).json({
        message: 'New verification code sent to your email.',
        previewUrl: emailResult.previewUrl // Apenas para teste com Ethereal
      });
    } else {
      res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }

  } catch (error) {
    console.error('Error during resending verification code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '9999y' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
