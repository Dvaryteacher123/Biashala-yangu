// ======================================================
// routes/index.routes.js
// Routes zote za duka (Home, Shop, Cart, Kurasa za taarifa, n.k.)
// ======================================================

const express = require('express');
const router = express.Router();

// ======================================================
// HOME PAGE  →  /
// Data: Firestore (products, banners, categories) — client-side
// ======================================================
router.get('/', (req, res) => {
  res.render('shop/index', {
    title: 'Nyumbani',
    description: 'Duka la nguo bora Tanzania — bei nafuu, ubora wa juu'
  });
});

// ======================================================
// SHOP PAGE  →  /shop
// Inaweza kupokea:  ?q=nguo  &category=men  &sort=price_asc
// Filtering yote inafanywa client-side kutoka Firestore
// ======================================================
router.get('/shop', (req, res) => {
  res.render('shop/shop', {
    title: 'Duka',
    description: 'Bidhaa zote za ClothingStore',
    query: {
      q: req.query.q || '',
      category: req.query.category || '',
      sort: req.query.sort || ''
    }
  });
});

// ======================================================
// PRODUCT DETAIL  →  /product/:id
// :id ni Firestore document ID ya bidhaa
// Ukurasa unasoma bidhaa hiyo moja kwa moja kutoka Firestore
// ======================================================
router.get('/product/:id', (req, res) => {
  res.render('shop/product-detail', {
    title: 'Maelezo ya Bidhaa',
    productId: req.params.id
  });
});

// ======================================================
// CART  →  /cart
// Cart inasomwa kutoka localStorage (client-side)
// ======================================================
router.get('/cart', (req, res) => {
  res.render('shop/cart', {
    title: 'Kikapu Changu'
  });
});

// ======================================================
// CHECKOUT  →  /checkout
// Oda itasave kwenye Firestore collection "orders"
// ======================================================
router.get('/checkout', (req, res) => {
  res.render('shop/checkout', {
    title: 'Kamilisha Malipo'
  });
});

// ======================================================
// ORDER SUCCESS  →  /order-success/:id
// Inaonyesha uthibitisho baada ya oda kusave Firestore
// ======================================================
router.get('/order-success/:id', (req, res) => {
  res.render('shop/order-success', {
    title: 'Oda Imekamilika',
    orderId: req.params.id
  });
});

// ======================================================
// ORDER TRACKING  →  /order-tracking
// Mtumiaji anaweka Order ID / email → Firestore inatoa hali
// ======================================================
router.get('/order-tracking', (req, res) => {
  res.render('shop/order-tracking', {
    title: 'Fuatilia Oda',
    query: { id: req.query.id || '' }
  });
});

// ======================================================
// WISHLIST  →  /wishlist
// Inasomwa kutoka Firestore: users/{uid}/wishlist
// ======================================================
router.get('/wishlist', (req, res) => {
  res.render('shop/wishlist', {
    title: 'Wishlist Yangu'
  });
});

// ======================================================
// KURASA ZA TAARIFA  (pages/*.ejs)
// ======================================================

// Kuhusu sisi
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'Kuhusu Sisi',
    description: 'Jifunze zaidi kuhusu ClothingStore'
  });
});

// Mawasiliano
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Mawasiliano',
    description: 'Wasiliana nasi kwa maswali yoyote'
  });
});

// FAQ
router.get('/faq', (req, res) => {
  res.render('pages/faq', {
    title: 'Maswali ya Mara kwa Mara',
    description: 'Majibu ya maswali yanayoulizwa sana'
  });
});

// Usafirishaji
router.get('/shipping', (req, res) => {
  res.render('pages/shipping', {
    title: 'Usafirishaji',
    description: 'Taratibu za usafirishaji wa bidhaa'
  });
});

// Kurudisha bidhaa
router.get('/returns', (req, res) => {
  res.render('pages/returns', {
    title: 'Kurudisha Bidhaa',
    description: 'Sera yetu ya kurudisha bidhaa'
  });
});

// Faragha
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'Sera ya Faragha',
    description: 'Jinsi tunavyolinda taarifa zako'
  });
});

// Masharti
router.get('/terms', (req, res) => {
  res.render('pages/terms', {
    title: 'Masharti na Vigezo',
    description: 'Masharti ya matumizi ya tovuti yetu'
  });
});

// Blog  →  /blog  (inaweza kupokea ?id=postId kwa post moja)
router.get('/blog', (req, res) => {
  res.render('pages/blog', {
    title: 'Blog',
    description: 'Habari na makala kutoka ClothingStore',
    query: { id: req.query.id || '' }
  });
});

// ======================================================
// 404 kwa routes hizi (zilizobaki zinaenda kwa server.js)
// ======================================================
// (Hakuna haja — server.js inashughulikia 404)

module.exports = router;
