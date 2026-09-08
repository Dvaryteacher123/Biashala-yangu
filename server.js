// server.js - Moyo wa mfumo wa DVARY-BUSINESS
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors()); // Kuruhusu majibu kutoka vyanzo tofauti
app.use(express.json()); // Kusoma data ya JSON inayotumwa (POST requests)
app.use(express.urlencoded({ extended: true })); // Kusoma data ya form

// ============================================
// ROUTER ZA HTML (Static Files)
// ============================================
// Hapa ndipo server inasoma router zote za HTML kwenye folder ya 'public'
// Ukipiga http://localhost:3000/auth/login -> inasoma public/auth/login.html
// Ukipiga http://localhost:3000/dashboard/claims -> inasoma public/dashboard/claims.html
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// API ROUTER (Backend - Kuunganisha na Supabase)
// ============================================

// Health check - kuangalia kama server iko poa
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'DVARY-BUSINESS API iko poa!',
    timestamp: new Date().toISOString()
  });
});

// API ya kuweka claim (Free Trial Code)
app.post('/api/claims/generate', async (req, res) => {
  try {
    // Kwa sasa tunatumia data bandia (baadae tutaunganisha na Supabase)
    const { userId, businessId } = req.body;
    
    // Tengeneza code ya kipekee
    const claimCode = `FREE-3M-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // Miezi 3 (siku 90)
    
    // Hapa baadae utaweka data kwenye Supabase table ya 'claims'
    // const { data, error } = await supabase.from('claims').insert({...});
    
    res.json({
      success: true,
      claimCode: claimCode,
      expiryDate: expiryDate.toISOString(),
      message: 'Umepata code ya miezi 3 bure!',
      // Kwa sasa tunarudisha tu, baadae tutaweka data halisi kutoka Supabase
    });
    
  } catch (error) {
    console.error('Error generating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuunda code. Jaribu tena.'
    });
  }
});

// API ya kupata claims zote (kwa ajili ya admin)
app.get('/api/claims', (req, res) => {
  // Baadae tutasoma kutoka Supabase
  res.json({
    success: true,
    claims: [
      { id: 1, userId: 1, claimCode: 'FREE-3M-ABC123', expiryDate: '2026-12-08', status: 'active' },
      { id: 2, userId: 2, claimCode: 'FREE-3M-XYZ789', expiryDate: '2026-09-08', status: 'expired' }
    ]
  });
});

// API ya kupata biashara zote (kwa ajili ya index.html)
app.get('/api/businesses', (req, res) => {
  // Baadae tutasoma kutoka Supabase
  res.json({
    success: true,
    businesses: [
      { id: 1, name: 'Outcrowd Studio', category: 'Ujenzi', views: 1200, likes: 320, isPro: true },
      { id: 2, name: 'HALO LAB', category: 'Teknolojia', views: 1900, likes: 946, isPro: true },
      { id: 3, name: 'Wello Agency', category: 'Masoko', views: 1100, likes: 569, isPro: true }
    ]
  });
});

// ============================================
// FALLBACK YA 404 (Ukurasa wa makosa)
// ============================================
// Ikishindwa kupata faili yoyote, ionyeshe 404.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ============================================
// ANZISHA SERVER
// ============================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('✅ DVARY-BUSINESS SERVER IMEANZA VIZURI!');
  console.log(`🌐 Nenda kwenye: http://localhost:${PORT}`);
  console.log(`📂 Router zote za HTML zinasomwa kutoka folder ya 'public'`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});
