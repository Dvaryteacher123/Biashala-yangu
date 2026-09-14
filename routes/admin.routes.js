// ======================================================
// routes/admin.routes.js
// Routes zote za Panel ya Admin
// Ulinzi: session (lazima ameingia) + role check client-side
// ======================================================

const express = require('express');
const router = express.Router();

// ======================================================
// MIDDLEWARE: Lazima mtumiaji awe ameingia
// ======================================================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}
router.use(requireLogin);

// ======================================================
// NOTE:
// Ukaguzi wa "role = admin" unafanywa client-side (Firestore):
//   users/{uid}.role === "admin"
// Kama sio admin, admin pages zinarudisha mtumiaji Home.
// Hii ni kwa sababu tunatumia Firebase CLIENT SDK.
// ======================================================

// ======================================================
// DASHBOARD  →  /admin
// Takwimu: idadi ya products, orders, customers, revenue
// Zote zinasomwa kutoka Firestore (aggregation client-side)
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
router.get('/products', (req, res) => {
  res.render('admin/products', {
    title: 'Bidhaa Zote',
    description: 'Simamia bidhaa zote za duka'
  });
});

router.get('/products/add', (req, res) => {
  res.render('admin/product-add', {
    title: 'Ongeza Bidhaa Mpya',
    description: 'Ongeza bidhaa mpya kwenye duka'
  });
});

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
router.get('/orders', (req, res) => {
  res.render('admin/orders', {
    title: 'Oda Zote',
    description: 'Simamia oda zote za wateja'
  });
});

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
router.get('/customers', (req, res) => {
  res.render('admin/customers', {
    title: 'Wateja',
    description: 'Orodha ya wateja wote'
  });
});

router.get('/customers/:id', (req, res) => {
  res.render('admin/customer-detail', {
    title: 'Maelezo ya Mteja',
    description: 'Angalia taarifa za mteja',
    customerId: req.params.id
  });
});

// ======================================================
// MESSAGES (kutoka contact form)
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
// USERS (wasimamizi wengine)
// ======================================================
router.get('/users', (req, res) => {
  res.render('admin/users', {
    title: 'Wasimamizi',
    description: 'Wasimamizi wengine wa mfumo'
  });
});

module.exports = router;
