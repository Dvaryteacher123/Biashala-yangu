// ======================================================
// routes/user.routes.js
// Routes za akaunti ya mteja: Profile, Orders, Addresses
// Zote zinalindwa — mtumiaji lazima awe ameingia
// ======================================================

const express = require('express');
const router = express.Router();

// ======================================================
// MIDDLEWARE: Lazima mtumiaji awe ameingia
// Kama haipo session.user → rudisha /auth/login
// ======================================================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect(
      '/auth/login?redirect=' + encodeURIComponent(req.originalUrl)
    );
  }
  next();
}

// Weka requireLogin kwenye routes zote za file hii
router.use(requireLogin);

// ======================================================
// PROFILE  →  GET /account/profile
// Ukurasa unaruhusu mtumiaji kubadilisha jina, simu, n.k.
// Data inasomwa / inahifadhiwa Firestore: users/{uid}
// ======================================================
router.get('/profile', (req, res) => {
  res.render('account/profile', {
    title: 'Wasifu Wangu',
    description: 'Badilisha taarifa za akaunti yako',
    // uid/email zinapatikana kutoka session.user (res.locals.currentUser)
  });
});

// ======================================================
// ORDERS  →  GET /account/orders
// Oda zote za mtumiaji zinasomwa Firestore:
//   collection: orders  →  where("userId","==",uid)
// ======================================================
router.get('/orders', (req, res) => {
  res.render('account/orders', {
    title: 'Oda Zangu',
    description: 'Historia ya oda zako zote'
  });
});

// ======================================================
// ADDRESSES  →  GET /account/addresses
// Anwani za mtumiaji zinasomwa Firestore:
//   collection: users/{uid}/addresses
// ======================================================
router.get('/addresses', (req, res) => {
  res.render('account/addresses', {
    title: 'Anwani Zangu',
    description: 'Anwani zako za kupokelea bidhaa'
  });
});

module.exports = router;
