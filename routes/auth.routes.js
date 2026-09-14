// ======================================================
// routes/auth.routes.js
// Routes za uthibitisho: Login, Signup, Forgot Password, Logout
// ======================================================

const express = require('express');
const router = express.Router();

// ======================================================
// LOGIN  →  GET /auth/login
// ======================================================
router.get('/login', (req, res) => {
  // Kama mtumiaji ameingia tayari (session ipo)
  if (req.session && req.session.user) {
    // Kama ni admin, mpeleke admin panel
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/');
  }
  res.render('auth/login', {
    title: 'Ingia',
    description: 'Ingia kwenye akaunti yako ya ClothingStore',
    redirect: req.query.redirect || '/'
  });
});

// ======================================================
// SIGNUP  →  GET /auth/signup
// ======================================================
router.get('/signup', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/signup', {
    title: 'Jiunge Nasi',
    description: 'Fungua akaunti mpya ya ClothingStore',
    redirect: req.query.redirect || '/'
  });
});

// ======================================================
// FORGOT PASSWORD  →  GET /auth/forgot-password
// ======================================================
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Umesahau Password',
    description: 'Weka email yako upokee link ya kubadilisha password'
  });
});

// ======================================================
// LOGOUT  →  POST /auth/logout
// Kwa cookie-session, tunafuta kwa kuweka req.session = null
// ======================================================
router.post('/logout', (req, res) => {
  // Futa session data
  req.session = null;
  res.json({ ok: true });
});

// ======================================================
// SESSION SYNC  →  POST /auth/sync-session
// ======================================================
router.post('/sync-session', (req, res) => {
  const { uid, email } = req.body || {};
  
  if (!uid || !email) {
    return res.status(400).json({ ok: false, error: 'Taarifa hazijakamilika' });
  }

  // Admin Email
  const ADMIN_EMAIL = 'dullamanyama0@gmail.com';
  
  const cleanEmail = String(email).trim().toLowerCase();
  const userRole = (cleanEmail === ADMIN_EMAIL.toLowerCase()) ? 'admin' : 'customer';

  // Hifadhi data ndogo sana ili cookie isijae (>4KB)
  req.session.user = {
    uid: uid,
    email: cleanEmail,
    role: userRole
  };

  res.json({ ok: true });
});

module.exports = router;

