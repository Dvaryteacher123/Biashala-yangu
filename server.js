// ======================================================
// server.js — Mlango wa kuingia wa Clothing Store
// ======================================================

const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Session — kwa ajili ya login na cart
app.use(session({
  secret: 'clothing-store-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // siku 1
}));

// Pass firebaseConfig + user info kwa KILA EJS page
app.use((req, res, next) => {
  res.locals.firebaseConfig = firebaseConfig;
  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
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
