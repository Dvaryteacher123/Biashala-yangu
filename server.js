// ============================================================
// SERVER.JS - DVARY BUSINESS FULL BACKEND (IMEREKEBISHWA)
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// SUPABASE CLIENT (Backend)
// ============================================================
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ============================================================
// MULTER CONFIG (for file uploads)
// ============================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// HELPER: CHECK USER CLAIM
// ============================================================
async function checkUserClaim(userId) {
  try {
    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Claim check error:', error);
      return { 
        hasClaim: false, 
        message: 'Kuna tatizo la kuangalia claim yako.',
        error: true 
      };
    }

    if (!claims || claims.length === 0) {
      return { 
        hasClaim: false, 
        message: 'Huna claim active. Tafadhali nunua claim ili kuendelea.',
        error: false 
      };
    }

    const claim = claims[0];
    const expiryDate = new Date(claim.expiry_date);
    const now = new Date();

    if (expiryDate < now) {
      await supabase
        .from('claims')
        .update({ status: 'expired' })
        .eq('id', claim.id);

      return { 
        hasClaim: false, 
        message: 'Claim yako imeisha muda. Tafadhali nunua claim mpya.',
        error: false,
        expired: true
      };
    }

    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return { 
      hasClaim: true, 
      claim: claim,
      daysRemaining: daysRemaining,
      expiryDate: expiryDate,
      message: `Claim yako ni active. Siku ${daysRemaining} zimebaki.`,
      error: false 
    };

  } catch (err) {
    console.error('Unexpected error in checkUserClaim:', err);
    return { 
      hasClaim: false, 
      message: 'Kuna hitilafu ya mfumo. Jaribu tena.',
      error: true 
    };
  }
}

// ============================================================
// MIDDLEWARE: Require Active Claim (IMEREKEBISHWA)
// ============================================================
async function requireActiveClaim(req, res, next) {
  // Jaribu kupata userId kutoka mahali mbalimbali
  let userId = req.body.userId || req.query.userId || req.headers['x-user-id'] || req.headers['X-User-Id'];

  // Ikiwa bado haipo, angalia kwenye body (baadhi ya frontend hutuma userId)
  if (!userId && req.body && req.body.userId) {
    userId = req.body.userId;
  }

  console.log('🔍 User ID received:', userId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID inahitajika. Tafadhali ingia tena.'
    });
  }

  const claimStatus = await checkUserClaim(userId);

  if (claimStatus.error) {
    return res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuangalia claim yako. Jaribu tena.'
    });
  }

  if (!claimStatus.hasClaim) {
    return res.status(403).json({
      success: false,
      message: claimStatus.message || 'Huna claim active. Tafadhali nunua claim ili kuendelea.',
      requiresClaim: true,
      claimExpired: claimStatus.expired || false
    });
  }

  req.claim = claimStatus.claim;
  req.daysRemaining = claimStatus.daysRemaining;
  next();
}

// ============================================================
// API: HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DVARY-BUSINESS API iko poa!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================================
// API: USER CLAIM STATUS
// ============================================================
app.get('/api/claims/status/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID inahitajika.'
    });
  }

  const claimStatus = await checkUserClaim(userId);

  if (claimStatus.error) {
    return res.status(500).json({
      success: false,
      message: claimStatus.message
    });
  }

  res.json({
    success: true,
    hasClaim: claimStatus.hasClaim,
    claim: claimStatus.claim || null,
    daysRemaining: claimStatus.daysRemaining || 0,
    expiryDate: claimStatus.expiryDate || null,
    message: claimStatus.message
  });
});

// ============================================================
// API: GENERATE FREE CLAIM (Miezi 3 Bure)
// ============================================================
app.post('/api/claims/generate', async (req, res) => {
  const { userId, businessId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID inahitajika.'
    });
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tayari una claim active. Subiri iishe au wasiliana na admin.'
      });
    }

    const claimCode = `FREE-3M-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);

    const { data: newClaim, error: insertError } = await supabase
      .from('claims')
      .insert([{
        user_id: userId,
        business_id: businessId || null,
        claim_code: claimCode,
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      claim: newClaim,
      claimCode: claimCode,
      expiryDate: expiryDate.toISOString(),
      message: '✅ Umepata code ya miezi 3 bure!'
    });

  } catch (err) {
    console.error('Generate claim error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuunda claim. Jaribu tena.'
    });
  }
});

// ============================================================
// API: GET ALL CLAIMS (Admin Only)
// ============================================================
app.get('/api/claims', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select('*, users(full_name, email), businesses(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      claims: data || []
    });
  } catch (err) {
    console.error('Get claims error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia claims.'
    });
  }
});

// ============================================================
// API: DELETE CLAIM (Admin Only)
// ============================================================
app.delete('/api/claims/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Claim imefutwa kikamilifu!'
    });
  } catch (err) {
    console.error('Delete claim error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kufuta claim.'
    });
  }
});

// ============================================================
// API: RENEW CLAIM (Admin Only)
// ============================================================
app.post('/api/claims/renew/:id', async (req, res) => {
  const { id } = req.params;
  const { months } = req.body;

  const monthsToAdd = months || 3;

  try {
    const { data: claim, error: getError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim haikupatikana.'
      });
    }

    const newExpiry = new Date(claim.expiry_date);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

    const { data, error } = await supabase
      .from('claims')
      .update({
        expiry_date: newExpiry.toISOString(),
        status: 'active'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      claim: data,
      message: `✅ Claim imerenew kikamilifu! Miezi ${monthsToAdd} imeongezwa.`
    });

  } catch (err) {
    console.error('Renew claim error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la ku-renew claim.'
    });
  }
});

// ============================================================
// API: EXPIRE CLAIM (Admin Only)
// ============================================================
app.post('/api/claims/expire/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('claims')
      .update({ status: 'expired' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      claim: data,
      message: '✅ Claim ime-expire kikamilifu!'
    });

  } catch (err) {
    console.error('Expire claim error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la ku-expire claim.'
    });
  }
});

// ============================================================
// API: GIVE CLAIM BY EMAIL (Admin Only)
// ============================================================
app.post('/api/claims/give-by-email', async (req, res) => {
  const { email, months, businessId } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email inahitajika.'
    });
  }

  const monthsToAdd = months || 3;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User aliye na email hii hapatikani.'
      });
    }

    const { data: existing, error: checkError } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${user.full_name || user.email} tayari ana claim active.`
      });
    }

    const claimCode = `CLAIM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

    const { data: claim, error: insertError } = await supabase
      .from('claims')
      .insert([{
        user_id: user.id,
        business_id: businessId || null,
        claim_code: claimCode,
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      claim: claim,
      user: user,
      message: `✅ Claim imewekwa kwa ${user.full_name || user.email}! Miezi ${monthsToAdd}. Code: ${claimCode}`
    });

  } catch (err) {
    console.error('Give claim by email error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuweka claim. Jaribu tena.'
    });
  }
});

// ============================================================
// API: GET ALL BUSINESSES (Public)
// ============================================================
app.get('/api/businesses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      businesses: data || []
    });
  } catch (err) {
    console.error('Get businesses error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia biashara.'
    });
  }
});

// ============================================================
// API: GET BUSINESS BY ID (Public)
// ============================================================
app.get('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Biashara haikupatikana.'
      });
    }

    res.json({
      success: true,
      business: data
    });
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia biashara.'
    });
  }
});

// ============================================================
// API: ADD BUSINESS (Requires Active Claim) - IMEREKEBISHWA
// ============================================================
app.post('/api/businesses', requireActiveClaim, async (req, res) => {
  const { 
    userId, name, description, address, location, phone, website,
    categoryImage, imageUrl, videoUrl, socialMedia, workingHours, services 
  } = req.body;

  // Soma userId kutoka header kama haipo kwenye body
  const finalUserId = userId || req.headers['x-user-id'] || req.headers['X-User-Id'];

  console.log('📝 Adding business for user:', finalUserId);
  console.log('📦 Data received:', { name, description, address, phone, website });

  if (!finalUserId || !name) {
    return res.status(400).json({
      success: false,
      message: 'User ID na jina la biashara vinahitajika.'
    });
  }

  try {
    // Prepare insert data (only include columns that exist)
    const insertData = {
      user_id: finalUserId,
      name: name,
      description: description || null,
      address: address || null,
      phone: phone || null,
      website: website || null,
      image_url: imageUrl || null,
      views: 0,
      likes: 0,
      is_active: true,
      is_pro: false,
      created_at: new Date().toISOString()
    };

    // Add optional fields only if they exist in the table (Supabase will ignore unknown columns? It will error)
    // To avoid errors, we check if columns exist. For simplicity, we add them conditionally.
    // But it's better to ensure columns exist. We'll add them anyway and catch error.
    if (categoryImage) insertData.category_image = categoryImage;
    if (location) insertData.location = location;
    if (videoUrl) insertData.video_url = videoUrl;
    if (socialMedia) insertData.social_media = socialMedia;
    if (workingHours) insertData.working_hours = workingHours;
    if (services) insertData.services = services;

    const { data, error } = await supabase
      .from('businesses')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // If error is about columns, inform user to add columns
      if (error.message && error.message.includes('column')) {
        return res.status(500).json({
          success: false,
          message: 'Kuna tatizo la muundo wa database. Tafadhali wasiliana na admin kuongeza columns mpya.'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      business: data,
      message: '✅ Biashara imewekwa kikamilifu!'
    });

  } catch (err) {
    console.error('Add business error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuweka biashara. Jaribu tena. Details: ' + err.message
    });
  }
});

// ============================================================
// API: UPDATE BUSINESS (Requires Active Claim)
// ============================================================
app.put('/api/businesses/:id', requireActiveClaim, async (req, res) => {
  const { id } = req.params;
  const { 
    userId, name, description, address, location, phone, website,
    categoryImage, imageUrl, videoUrl, socialMedia, workingHours, services,
    isActive, isPro 
  } = req.body;

  const finalUserId = userId || req.headers['x-user-id'] || req.headers['X-User-Id'];

  if (!finalUserId) {
    return res.status(401).json({
      success: false,
      message: 'User ID inahitajika.'
    });
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('businesses')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Biashara haikupatikana.'
      });
    }

    if (existing.user_id !== finalUserId) {
      return res.status(403).json({
        success: false,
        message: 'Huna ruhusa ya kuhariri biashara hii.'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (categoryImage !== undefined) updateData.category_image = categoryImage;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (videoUrl !== undefined) updateData.video_url = videoUrl;
    if (socialMedia !== undefined) updateData.social_media = socialMedia;
    if (workingHours !== undefined) updateData.working_hours = workingHours;
    if (services !== undefined) updateData.services = services;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isPro !== undefined) updateData.is_pro = isPro;

    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      business: data,
      message: '✅ Mabadiliko yamehifadhiwa kikamilifu!'
    });

  } catch (err) {
    console.error('Update business error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuhifadhi mabadiliko. Jaribu tena.'
    });
  }
});

// ============================================================
// API: DELETE BUSINESS (Requires Active Claim)
// ============================================================
app.delete('/api/businesses/:id', requireActiveClaim, async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId || req.headers['x-user-id'] || req.headers['X-User-Id'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID inahitajika.'
    });
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('businesses')
      .select('user_id, image_url, video_url, category_image')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Biashara haikupatikana.'
      });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Huna ruhusa ya kufuta biashara hii.'
      });
    }

    const filesToDelete = [];
    if (existing.image_url) {
      try {
        const path = existing.image_url.split('/').slice(-2).join('/');
        filesToDelete.push(path);
      } catch (e) {}
    }
    if (existing.video_url) {
      try {
        const path = existing.video_url.split('/').slice(-2).join('/');
        filesToDelete.push(path);
      } catch (e) {}
    }
    if (existing.category_image) {
      try {
        const path = existing.category_image.split('/').slice(-2).join('/');
        filesToDelete.push(path);
      } catch (e) {}
    }

    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from('business-files').remove(filesToDelete);
      } catch (err) {
        console.error('Delete files error:', err);
      }
    }

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: '✅ Biashara imefutwa kikamilifu!'
    });

  } catch (err) {
    console.error('Delete business error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kufuta biashara. Jaribu tena.'
    });
  }
});

// ============================================================
// API: UPLOAD IMAGE (Base64)
// ============================================================
app.post('/api/upload-image', requireActiveClaim, async (req, res) => {
  const { userId, imageBase64, fileName } = req.body;

  if (!userId || !imageBase64) {
    return res.status(400).json({
      success: false,
      message: 'User ID na picha vinahitajika.'
    });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileExt = fileName ? fileName.split('.').pop() : 'jpg';
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-files')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt}`
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('business-files')
      .getPublicUrl(data.path);

    res.json({
      success: true,
      imageUrl: urlData.publicUrl,
      message: '✅ Picha imepakiwa kikamilifu!'
    });

  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia picha. Jaribu tena.'
    });
  }
});

// ============================================================
// API: UPLOAD FILE (Multer)
// ============================================================
app.post('/api/upload-file', requireActiveClaim, upload.single('file'), async (req, res) => {
  const { userId, folder } = req.body;
  const file = req.file;

  if (!userId || !file) {
    return res.status(400).json({
      success: false,
      message: 'User ID na file vinahitajika.'
    });
  }

  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}/${Date.now()}${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-files')
      .upload(fileName, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('business-files')
      .getPublicUrl(data.path);

    res.json({
      success: true,
      fileUrl: urlData.publicUrl,
      message: '✅ File imepakiwa kikamilifu!'
    });

  } catch (err) {
    console.error('Upload file error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia file. Jaribu tena.'
    });
  }
});

// ============================================================
// API: REGISTER BUSINESS (Multer - Image & Video)
// ============================================================
app.post('/api/register-business', requireActiveClaim, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { business_name, location, user_id, address, phone, website, description, category } = req.body;
    const files = req.files;

    let imageUrl = '';
    let videoUrl = '';

    if (files && files.image) {
      const imgFile = files.image[0];
      const imgExt = path.extname(imgFile.originalname);
      const imgName = `${user_id}/${Date.now()}-img${imgExt}`;
      const { error: imgError } = await supabase.storage
        .from('business-files')
        .upload(imgName, imgFile.buffer, { cacheControl: '3600', contentType: imgFile.mimetype });
      if (imgError) throw imgError;
      const { data: imgUrlData } = supabase.storage.from('business-files').getPublicUrl(imgName);
      imageUrl = imgUrlData.publicUrl;
    }

    if (files && files.video) {
      const vidFile = files.video[0];
      const vidExt = path.extname(vidFile.originalname);
      const vidName = `${user_id}/${Date.now()}-vid${vidExt}`;
      const { error: vidError } = await supabase.storage
        .from('business-files')
        .upload(vidName, vidFile.buffer, { cacheControl: '3600', contentType: vidFile.mimetype });
      if (vidError) throw vidError;
      const { data: vidUrlData } = supabase.storage.from('business-files').getPublicUrl(vidName);
      videoUrl = vidUrlData.publicUrl;
    }

    let locationObj = location;
    if (typeof location === 'string') {
      try { locationObj = JSON.parse(location); } catch (e) { locationObj = { address: location }; }
    }

    const { data, error: dbError } = await supabase
      .from('businesses')
      .insert([{
        user_id: user_id,
        name: business_name,
        description: description || null,
        address: address || null,
        location: locationObj || null,
        phone: phone || null,
        website: website || null,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        category: category || null,
        views: 0,
        likes: 0,
        is_active: true,
        is_pro: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    return res.status(200).json({ 
      success: true, 
      business: data,
      message: '✅ Biashara imesajiliwa kikamilifu na location imehifadhiwa!' 
    });

  } catch (err) {
    console.error('Register business error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      message: 'Kuna tatizo la kusajili biashara. Jaribu tena.'
    });
  }
});

// ============================================================
// API: GET ALL USERS (Admin Only)
// ============================================================
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      users: data || []
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia users.'
    });
  }
});

// ============================================================
// API: BLOCK USER (Admin Only)
// ============================================================
app.post('/api/users/block/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data,
      message: '✅ User ameblock kikamilifu!'
    });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kumblock user.'
    });
  }
});

// ============================================================
// API: UNBLOCK USER (Admin Only)
// ============================================================
app.post('/api/users/unblock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data,
      message: '✅ User ameunblock kikamilifu!'
    });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kumunblock user.'
    });
  }
});

// ============================================================
// API: GET ALL REVIEWS (Public + Admin)
// ============================================================
app.get('/api/reviews', async (req, res) => {
  const { businessId } = req.query;

  try {
    let query = supabase.from('reviews').select('*, users(full_name)');

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    query = query.eq('status', 'approved').order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      reviews: data || []
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia reviews.'
    });
  }
});

// ============================================================
// API: ADD REVIEW (Public - No Claim Required)
// ============================================================
app.post('/api/reviews', async (req, res) => {
  const { businessId, userId, userName, rating, comment } = req.body;

  if (!businessId || !userId || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Business ID, User ID, na rating vinahitajika.'
    });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        business_id: businessId,
        user_id: userId,
        user_name: userName || null,
        rating: rating,
        comment: comment || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      review: data,
      message: '✅ Review imetumwa! Inasubiri kuidhinishwa na Admin.'
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kutuma review. Jaribu tena.'
    });
  }
});

// ============================================================
// API: APPROVE REVIEW (Admin Only)
// ============================================================
app.post('/api/reviews/approve/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      review: data,
      message: '✅ Review imeapprove kikamilifu!'
    });
  } catch (err) {
    console.error('Approve review error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la ku-approve review.'
    });
  }
});

// ============================================================
// API: REJECT REVIEW (Admin Only)
// ============================================================
app.post('/api/reviews/reject/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      review: data,
      message: '✅ Review imereject kikamilifu!'
    });
  } catch (err) {
    console.error('Reject review error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la ku-reject review.'
    });
  }
});

// ============================================================
// API: DELETE REVIEW (Admin Only)
// ============================================================
app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: '✅ Review imefutwa kikamilifu!'
    });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kufuta review.'
    });
  }
});

// ============================================================
// API: GET CONTACT MESSAGES (Admin Only)
// ============================================================
app.get('/api/contact-messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      messages: data || []
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia ujumbe.'
    });
  }
});

// ============================================================
// API: DELETE CONTACT MESSAGE (Admin Only)
// ============================================================
app.delete('/api/contact-messages/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: '✅ Ujumbe umefutwa kikamilifu!'
    });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kufuta ujumbe.'
    });
  }
});

// ============================================================
// API: GET SETTINGS (Public)
// ============================================================
app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.json({
      success: true,
      settings: data && data.length > 0 ? data[0] : null
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia settings.'
    });
  }
});

// ============================================================
// API: UPDATE SETTINGS (Admin Only)
// ============================================================
app.put('/api/settings', async (req, res) => {
  const { siteName, siteTagline, contactEmail, contactPhone, siteDescription } = req.body;

  try {
    const { data: existing, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    let result;
    if (existing && existing.length > 0) {
      result = await supabase
        .from('settings')
        .update({
          site_name: siteName,
          site_tagline: siteTagline,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          site_description: siteDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('settings')
        .insert([{
          site_name: siteName,
          site_tagline: siteTagline,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          site_description: siteDescription,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    res.json({
      success: true,
      settings: result.data,
      message: '✅ Mipangilio imehifadhiwa kikamilifu!'
    });

  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kuhifadhi mipangilio.'
    });
  }
});

// ============================================================
// API: GET DASHBOARD STATS (Admin Only)
// ============================================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { count: totalUsers, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    const { count: totalBusinesses, error: bizError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    if (bizError) throw bizError;

    const { count: totalClaims, error: claimError } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (claimError) throw claimError;

    const { count: totalBlocked, error: blockError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', true);

    if (blockError) throw blockError;

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalBusinesses: totalBusinesses || 0,
        totalClaims: totalClaims || 0,
        totalBlocked: totalBlocked || 0
      }
    });

  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Kuna tatizo la kupakia stats.'
    });
  }
});

// ============================================================
// FALLBACK: 404 Page
// ============================================================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('✅ DVARY-BUSINESS SERVER IMEANZA VIZURI!');
  console.log(`🌐 Nenda kwenye: http://localhost:${PORT}`);
  console.log(`📂 Router zote za HTML zinasomwa kutoka folder ya 'public'`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});
