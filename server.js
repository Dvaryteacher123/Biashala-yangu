// ======================================================
// server.js
// Faili kuu la kuwasha server na kuunganisha kila kitu
// ======================================================

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// ======================================================
// 1. MIDDLEWARES ZA MSINGI
// ======================================================

// Kusoma data zinazotumgwa kupitia fomu (Forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Kuwezesha mfumo wa Sessions ili utambue nani kaingia (Login)
app.use(session({
    secret: 'dvary_store_super_secret_key_2026', // Badilisha hii iwe neno lako la siri
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // Session inadumu kwa saa 24
    }
}));

// Kuweka EJS kuwa view engine na kuonyesha folda ya views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Kuweka folda ya public kwa ajili ya picha, client-side JS, n.k.
app.use(express.static(path.join(__dirname, 'public')));


// ======================================================
// 2. KUTANGAZA NA KUSOMA ROUTES ZOTE
// ======================================================

const indexRoutes = require('./routes/index.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

// Kutumia hizo routes kwenye mfumo
app.use('/', indexRoutes);         // Home, Shop, Cart, Kurasa za taarifa
app.use('/auth', authRoutes);      // Login, Signup
app.use('/user', userRoutes);      // Profile, Maagizo ya mteja
app.use('/admin', adminRoutes);    // Admin Panel (Duka lao)


// ======================================================
// 3. KUWASHA SERVER KWENYE PORT 3000
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server inatembea safi kabisa kwenye: http://localhost:${PORT} 🚀`);
});

