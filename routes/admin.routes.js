// ======================================================
// routes/admin.routes.js
// ADMIN PANEL ROUTES
//
// ADMIN MKUU PEKEE:
// dullamanyama0@gmail.com
//
// Mtu mwingine yeyote akijaribu kuingia /admin:
// - Hatapata Admin Panel
// - Ataelekezwa Home
//
// ======================================================

const express = require('express');
const router = express.Router();


// ======================================================
// ADMIN EMAIL
// ======================================================

const ADMIN_EMAIL = 'dullamanyama0@gmail.com';


// ======================================================
// 1. REQUIRE LOGIN
// ======================================================

function requireLogin(req, res, next) {

  // Kama haja-login
  if (!req.session || !req.session.user) {

    return res.redirect(
      '/auth/login?redirect=' +
      encodeURIComponent(req.originalUrl)
    );
  }

  next();
}


// ======================================================
// 2. REQUIRE MAIN ADMIN
// ======================================================
//
// Hapa ndipo tunamzuia admin mwingine.
//
// Ni email hii tu inayoruhusiwa:
// dullamanyama0@gmail.com
//
// ======================================================

function requireMainAdmin(req, res, next) {

  const user = req.session.user;

  // Kama hakuna user
  if (!user) {
    return res.redirect('/auth/login');
  }

  // Chukua email ya aliyeingia
  const userEmail = String(user.email || '')
    .trim()
    .toLowerCase();

  // Linganisha email
  if (userEmail !== ADMIN_EMAIL.toLowerCase()) {

    console.log(
      `[ADMIN BLOCKED] ${userEmail || 'Unknown user'} tried to access admin panel`
    );

    // Mtu huyu si admin mkuu
    return res.redirect('/');
  }

  // Ni admin mkuu
  next();
}


// ======================================================
// 3. APPLY MIDDLEWARE KWA ADMIN ROUTES ZOTE
// ======================================================

router.use(requireLogin);
router.use(requireMainAdmin);


// ======================================================
// DASHBOARD
// /admin
// ======================================================

router.get('/', (req, res) => {

  res.render('admin/index', {
    title: 'Dashboard',
    description: 'Muhtasari wa duka'
  });

});


// ======================================================
// PRODUCTS
// ======================================================

// Orodha ya bidhaa
router.get('/products', (req, res) => {

  res.render('admin/products', {
    title: 'Bidhaa Zote',
    description: 'Simamia bidhaa zote za duka'
  });

});


// Ongeza bidhaa
router.get('/products/add', (req, res) => {

  res.render('admin/product-add', {
    title: 'Ongeza Bidhaa Mpya',
    description: 'Ongeza bidhaa mpya kwenye duka'
  });

});


// Edit bidhaa
router.get('/products/edit/:id', (req, res) => {

  res.render('admin/product-edit', {
    title: 'Badilisha Bidhaa',
    description: 'Badilisha taarifa za bidhaa',
    productId: req.params.id
  });

});


// ======================================================
// CATEGORIES
// ======================================================

router.get('/categories', (req, res) => {

  res.render('admin/categories', {
    title: 'Makundi ya Bidhaa',
    description: 'Simamia makundi ya bidhaa'
  });

});


// ======================================================
// INVENTORY
// ======================================================

router.get('/inventory', (req, res) => {

  res.render('admin/inventory', {
    title: 'Stoko',
    description: 'Fuatilia stoko ya bidhaa'
  });

});


// ======================================================
// BANNERS
// ======================================================

router.get('/banners', (req, res) => {

  res.render('admin/banners', {
    title: 'Mabango ya Matangazo',
    description: 'Simamia mabango ya mbele ya duka'
  });

});


// ======================================================
// ORDERS
// ======================================================

// Oda zote
router.get('/orders', (req, res) => {

  res.render('admin/orders', {
    title: 'Oda Zote',
    description: 'Simamia oda zote za wateja'
  });

});


// Maelezo ya oda
router.get('/orders/:id', (req, res) => {

  res.render('admin/order-detail', {
    title: 'Maelezo ya Oda',
    description: 'Angalia maelezo kamili ya oda',
    orderId: req.params.id
  });

});


// ======================================================
// PAYMENTS
// ======================================================

router.get('/payments', (req, res) => {

  res.render('admin/payments', {
    title: 'Malipo',
    description: 'Taarifa za malipo yote'
  });

});


// ======================================================
// COUPONS
// ======================================================

router.get('/coupons', (req, res) => {

  res.render('admin/coupons', {
    title: 'Punguzo la Bei',
    description: 'Simamia kuponi za punguzo'
  });

});


// ======================================================
// CUSTOMERS
// ======================================================

// Wateja wote
router.get('/customers', (req, res) => {

  res.render('admin/customers', {
    title: 'Wateja',
    description: 'Orodha ya wateja wote'
  });

});


// Maelezo ya customer
router.get('/customers/:id', (req, res) => {

  res.render('admin/customer-detail', {
    title: 'Maelezo ya Mteja',
    description: 'Angalia taarifa za mteja',
    customerId: req.params.id
  });

});


// ======================================================
// MESSAGES
// ======================================================

router.get('/messages', (req, res) => {

  res.render('admin/messages', {
    title: 'Ujumbe wa Wateja',
    description: 'Ujumbe uliotumwa na wateja'
  });

});


// ======================================================
// REPORTS
// ======================================================

router.get('/reports', (req, res) => {

  res.render('admin/reports', {
    title: 'Ripoti za Mauzo',
    description: 'Ripoti za mauzo kwa kipindi'
  });

});


// ======================================================
// ANALYTICS
// ======================================================

router.get('/analytics', (req, res) => {

  res.render('admin/analytics', {
    title: 'Uchambuzi',
    description: 'Uchambuzi wa biashara'
  });

});


// ======================================================
// REVIEWS
// ======================================================

router.get('/reviews', (req, res) => {

  res.render('admin/reviews', {
    title: 'Maoni ya Wateja',
    description: 'Maoni na nyota kutoka kwa wateja'
  });

});


// ======================================================
// SETTINGS
// ======================================================

router.get('/settings', (req, res) => {

  res.render('admin/settings', {
    title: 'Mipangilio ya Duka',
    description: 'Mipangilio ya jumla ya duka'
  });

});


// ======================================================
// USERS / ADMINISTRATORS
// ======================================================
//
// Kwa sasa page hii bado ipo kwa admin mkuu.
// Admin mkuu ndiye pekee anayeweza kuiona.
//
// Kama hutaki kabisa sehemu ya kuongeza admins wengine,
// unaweza kuifuta route hii pamoja na link yake kwenye UI.
// ======================================================

router.get('/users', (req, res) => {

  res.render('admin/users', {
    title: 'Wasimamizi',
    description: 'Wasimamizi wa mfumo'
  });

});


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
