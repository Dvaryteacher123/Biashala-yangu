// ======================================================
// routes/auth.routes.js
// Routes za uthibitisho: Login, Signup, Forgot Password, Logout
// Uthibitisho halisi unafanywa na Firebase Auth (client-side)
// ======================================================

const express = require('express');
const router = express.Router();

// ======================================================
// LOGIN  →  GET /auth/login
// Ukurasa una form; Firebase Auth inafanya kazi client-side
// ======================================================
router.get('/login', (req, res) => {
  // Kama mtumiaji ameingia tayari (session), mpeleke Home
  if (req.session.user) {
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
  if (req.session.user) {
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
// Firebase Auth inatuma email ya kubadilisha password
// ======================================================
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Umesahau Password',
    description: 'Weka email yako upokee link ya kubadilisha password'
  });
});

// ======================================================
// LOGOUT  →  POST /auth/logout
// Inafuta session upande wa server, kisha inarudi Home.
// Upande wa client, JS pia inafanya auth.signOut() (Firebase Auth).
// ======================================================
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ ok: false, error: 'Imeshindikana kutoka' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// ======================================================
// SESSION SYNC  →  POST /auth/sync-session
// Client (baada ya login/signup kwa Firebase Auth) inatuma
// taarifa za mtumiaji hapa ili server iweke kwenye session.
// Hii ni HALISI — inatoka Firebase user object, sio data ya uongo.
// ======================================================
router.post('/sync-session', (req, res) => {
  const { uid, email, displayName, photoURL } = req.body || {};
  if (!uid || !email) {
    return res.status(400).json({ ok: false, error: 'Taarifa hazijakamilika' });
  }
  req.session.user = {
    uid,
    email,
    displayName: displayName || '',
    photoURL: photoURL || ''
  };
  res.json({ ok: true });
});

module.exports = router;
