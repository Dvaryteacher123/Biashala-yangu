// ======================================================
// server.js — Mlango wa kuingia wa Clothing Store
// ======================================================

const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Render ipo nyuma ya proxy
app.set('trust proxy', 1);

// ======================================================
// Firebase configuration (itapitishwa kwa kila EJS view)
// ======================================================
const firebaseConfig = {
  apiKey: "AIzaSyC-8IRm50zrlHWjG-jpfzrh0YtprC1Tsaw",
  authDomain: "product-store-6a651.firebaseapp.com",
  projectId: "product-store-6a651",
  storageBucket: "product-store-6a651.firebasestorage.app",
  messagingSenderId: "379449735108",
  appId: "1:379449735108:web:bf0bb51d68f28273cdd691"
};

// ======================================================
// EJS — View Engine
// ======================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======================================================
// Middleware
// ======================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session — Inatumia cookie-session badala ya RAM (MemoryStore)
app.use(cookieSession({
  name: 'clothing_store_session',
  keys: ['clothing-store-secret-2025', 'extra-secret-key-2026'],
  maxAge: 7 * 24 * 60 * 60 * 1000, // Siku 7 za login bila kutolewa
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
}));

// Pass firebaseConfig + user info kwa KILA EJS page
app.use((req, res, next) => {
  res.locals.firebaseConfig = firebaseConfig;
  res.locals.currentUser = (req.session && req.session.user) ? req.session.user : null;
  res.locals.cartCount = (req.session && req.session.cart) ? req.session.cart.length : 0;
  next();
});

// ======================================================
// Routes
// ======================================================
app.use('/',        require('./routes/index.routes'));
app.use('/auth',    require('./routes/auth.routes'));
app.use('/account', require('./routes/user.routes'));
app.use('/admin',   require('./routes/admin.routes'));

// ======================================================
// 404 — Ukurasa haupatikani
// ======================================================
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Ukurasa Haupatikani',
    message: 'Samahani, ukurasa uliouomba haupo.'
  });
});

// ======================================================
// Error Handler
// ======================================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).send('Kuna tatizo kwenye server. Jaribu tena baadaye.');
});

// ======================================================
// Anzisha Server
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server inaendesha: http://localhost:${PORT}`);
  console.log(`📦 Firestore Project: ${firebaseConfig.projectId}`);
});
