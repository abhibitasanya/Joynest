import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database connection (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'joynest',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'wav', 'm4a', 'mp4', 'mov'],
    public_id: (req, file) => {
      const uniqueName = `${uuidv4()}-${Date.now()}`;
      return uniqueName;
    },
    resource_type: 'auto',
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|m4a|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype.startsWith('image/') || 
                     file.mimetype.startsWith('audio/') ||
                     file.mimetype.startsWith('video/');
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, audio, and video files are allowed'));
  }
});

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Error handling middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Initialize database tables
async function initDB() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        recipient VARCHAR(255),
        occasion VARCHAR(255),
        template VARCHAR(50),
        theme JSONB,
        custom_css TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        published_url VARCHAR(255),
        password_protected BOOLEAN DEFAULT false,
        access_password VARCHAR(255),
        views INTEGER DEFAULT 0,
        last_visited TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gallery images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        caption TEXT,
        alt_text VARCHAR(255),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Journal pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        page_number INTEGER DEFAULT 1,
        background_color VARCHAR(7),
        font_family VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Letters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        sender_name VARCHAR(255),
        signature VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audio tracks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audio_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        title VARCHAR(255),
        artist VARCHAR(255),
        duration INTEGER,
        order_index INTEGER DEFAULT 0,
        autoplay BOOLEAN DEFAULT false,
        loop BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Timeline events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE,
        display_date VARCHAR(100),
        image_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        preview_image VARCHAR(500),
        theme JSONB,
        is_premium BOOLEAN DEFAULT false,
        popularity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User activity log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default templates
    const templateCount = await pool.query('SELECT COUNT(*) FROM templates');
    if (parseInt(templateCount.rows[0].count) === 0) {
      const defaultTemplates = [
        {
          name: 'Birthday Delight',
          category: 'birthday',
          description: 'Perfect for birthday celebrations with warm colors and festive elements',
          preview_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop',
          theme: { colors: ['#B76E79', '#F5EDD9', '#C9A84C'], font: 'serif' },
          popularity: 100
        },
        {
          name: 'Wedding Story',
          category: 'wedding',
          description: 'Elegant wedding template with romantic aesthetics',
          preview_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=280&fit=crop',
          theme: { colors: ['#FAF7F2', '#C9A84C', '#8A7F74'], font: 'serif' },
          popularity: 95
        },
        {
          name: 'Love Letters',
          category: 'romance',
          description: 'Romantic template for love letters and anniversaries',
          preview_image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=280&fit=crop',
          theme: { colors: ['#FAF0F2', '#B76E79', '#F5EDD9'], font: 'cursive' },
          popularity: 90
        },
        {
          name: 'Travel Diaries',
          category: 'travel',
          description: 'Adventure-themed template for travel memories',
          preview_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop',
          theme: { colors: ['#EFF5EF', '#1C3A2A', '#C9A84C'], font: 'sans-serif' },
          popularity: 85
        },
        {
          name: 'Graduation Day',
          category: 'graduation',
          description: 'Celebrate academic achievements with this proud template',
          preview_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=280&fit=crop',
          theme: { colors: ['#F5EDD9', '#2D5A3F', '#C9A84C'], font: 'serif' },
          popularity: 80
        },
        {
          name: 'Family Album',
          category: 'family',
          description: 'Warm family-oriented template for cherished memories',
          preview_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=280&fit=crop',
          theme: { colors: ['#FAF7F2', '#8FAF8F', '#C5B8D4'], font: 'serif' },
          popularity: 75
        }
      ];

      for (const template of defaultTemplates) {
        await pool.query(
          `INSERT INTO templates (name, category, description, preview_image, theme, popularity) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [template.name, template.category, template.description, 
           template.preview_image, JSON.stringify(template.theme), template.popularity]
        );
      }
    }

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Log activity
async function logActivity(userId, projectId, action, details, req) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, project_id, action, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, projectId, action, JSON.stringify(details), 
       req.ip, req.get('user-agent')]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'JoyNest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Supabase',
    storage: 'Cloudinary'
  });
});

// Template routes
app.get('/api/templates', asyncHandler(async (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM templates ORDER BY popularity DESC';
  const params = [];
  
  if (category) {
    query += ' WHERE category = $1';
    params.push(category);
  }
  
  const result = await pool.query(query, params);
  res.json(result.rows);
}));

app.get('/api/templates/:id', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM templates WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(result.rows[0]);
}));

// Auth routes
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email.toLowerCase(), hashedPassword, name || email.split('@')[0]]
  );
  
  const token = jwt.sign(
    { userId: result.rows[0].id, email: result.rows[0].email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  await logActivity(result.rows[0].id, null, 'signup', { email }, req);
  
  res.status(201).json({
    user: result.rows[0],
    token
  });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const validPassword = await bcrypt.compare(password, result.rows[0].password);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const token = jwt.sign(
    { userId: result.rows[0].id, email: result.rows[0].email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  await logActivity(result.rows[0].id, null, 'login', { email }, req);
  
  res.json({
    user: {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      avatar_url: result.rows[0].avatar_url
    },
    token
  });
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
    [req.user.userId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(result.rows[0]);
}));

app.put('/api/auth/profile', authenticateToken, upload.single('avatar'), asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (name) {
    updates.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  
  if (req.file) {
    updates.push(`avatar_url = $${paramCount}`);
    values.push(req.file.path);
    paramCount++;
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  values.push(req.user.userId);
  
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $${paramCount} RETURNING id, email, name, avatar_url`,
    values
  );
  
  res.json(result.rows[0]);
}));

// Project routes
app.get('/api/projects', authenticateToken, asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM projects WHERE user_id = $1';
  const params = [req.user.userId];
  let paramCount = 2;
  
  if (status) {
    query += ` AND status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }
  
  if (search) {
    query += ` AND (title ILIKE $${paramCount} OR recipient ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }
  
  query += ' ORDER BY updated_at DESC';
  
  const result = await pool.query(query, params);
  res.json(result.rows);
}));

app.post('/api/projects', authenticateToken, asyncHandler(async (req, res) => {
  const { title, recipient, occasion, template, theme, custom_css } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const result = await pool.query(
    `INSERT INTO projects (user_id, title, recipient, occasion, template, theme, custom_css) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [req.user.userId, title, recipient, occasion, template, 
     theme ? JSON.stringify(theme) : null, custom_css]
  );
  
  await logActivity(req.user.userId, result.rows[0].id, 'project_created', { title }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.get('/api/projects/:id', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.userId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const project = result.rows[0];
  if (project.theme) {
    project.theme = JSON.parse(project.theme);
  }
  
  res.json(project);
}));

app.put('/api/projects/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { title, recipient, occasion, template, theme, custom_css, status, password_protected, access_password } = req.body;
  
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (title !== undefined) {
    updates.push(`title = $${paramCount}`);
    values.push(title);
    paramCount++;
  }
  if (recipient !== undefined) {
    updates.push(`recipient = $${paramCount}`);
    values.push(recipient);
    paramCount++;
  }
  if (occasion !== undefined) {
    updates.push(`occasion = $${paramCount}`);
    values.push(occasion);
    paramCount++;
  }
  if (template !== undefined) {
    updates.push(`template = $${paramCount}`);
    values.push(template);
    paramCount++;
  }
  if (theme !== undefined) {
    updates.push(`theme = $${paramCount}`);
    values.push(theme ? JSON.stringify(theme) : null);
    paramCount++;
  }
  if (custom_css !== undefined) {
    updates.push(`custom_css = $${paramCount}`);
    values.push(custom_css);
    paramCount++;
  }
  if (status !== undefined) {
    updates.push(`status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }
  if (password_protected !== undefined) {
    updates.push(`password_protected = $${paramCount}`);
    values.push(password_protected);
    paramCount++;
  }
  if (access_password !== undefined) {
    updates.push(`access_password = $${paramCount}`);
    values.push(access_password);
    paramCount++;
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(req.params.id, req.user.userId);
  
  const result = await pool.query(
    `UPDATE projects SET ${updates.join(', ')} 
     WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const project = result.rows[0];
  if (project.theme) {
    project.theme = JSON.parse(project.theme);
  }
  
  await logActivity(req.user.userId, project.id, 'project_updated', { updates: updates.join(', ') }, req);
  
  res.json(project);
}));

app.delete('/api/projects/:id', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.userId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  await logActivity(req.user.userId, req.params.id, 'project_deleted', {}, req);
  
  res.json({ message: 'Project deleted successfully' });
}));

// Gallery routes
app.get('/api/projects/:id/gallery', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM gallery_images WHERE project_id = $1 ORDER BY order_index, created_at',
    [req.params.id]
  );
  res.json(result.rows);
}));

app.post('/api/projects/:id/gallery', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { caption, alt_text, order_index } = req.body;
  const imageUrl = req.file.path;
  const thumbnailUrl = req.file.path; // Cloudinary provides thumbnails automatically
  
  const result = await pool.query(
    'INSERT INTO gallery_images (project_id, url, thumbnail_url, caption, alt_text, order_index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.params.id, imageUrl, thumbnailUrl, caption, alt_text, order_index || 0]
  );
  
  await logActivity(req.user.userId, req.params.id, 'image_added', { url: imageUrl }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.put('/api/gallery/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { caption, alt_text, order_index } = req.body;
  
  const result = await pool.query(
    `UPDATE gallery_images SET caption = COALESCE($1, caption), 
                              alt_text = COALESCE($2, alt_text),
                              order_index = COALESCE($3, order_index)
     WHERE id = $4 RETURNING *`,
    [caption, alt_text, order_index, req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  res.json(result.rows[0]);
}));

app.delete('/api/gallery/:id', authenticateToken, asyncHandler(async (req, res) => {
  const imageResult = await pool.query(
    'SELECT url FROM gallery_images WHERE id = $1',
    [req.params.id]
  );
  
  if (imageResult.rows.length > 0) {
    // Delete from Cloudinary
    const publicId = imageResult.rows[0].url.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(`joynest/${publicId}`);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }
  
  await pool.query('DELETE FROM gallery_images WHERE id = $1', [req.params.id]);
  
  res.json({ message: 'Image deleted successfully' });
}));

// Journal routes
app.get('/api/projects/:id/journal', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM journal_pages WHERE project_id = $1 ORDER BY page_number, created_at',
    [req.params.id]
  );
  res.json(result.rows);
}));

app.post('/api/projects/:id/journal', authenticateToken, asyncHandler(async (req, res) => {
  const { content, page_number, background_color, font_family } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const result = await pool.query(
    'INSERT INTO journal_pages (project_id, content, page_number, background_color, font_family) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.params.id, content, page_number || 1, background_color, font_family]
  );
  
  await logActivity(req.user.userId, req.params.id, 'journal_page_added', { page_number }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.put('/api/journal/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { content, page_number, background_color, font_family } = req.body;
  
  const result = await pool.query(
    `UPDATE journal_pages SET content = COALESCE($1, content), 
                              page_number = COALESCE($2, page_number),
                              background_color = COALESCE($3, background_color),
                              font_family = COALESCE($4, font_family),
                              updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 RETURNING *`,
    [content, page_number, background_color, font_family, req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Journal page not found' });
  }
  
  res.json(result.rows[0]);
}));

app.delete('/api/journal/:id', authenticateToken, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM journal_pages WHERE id = $1', [req.params.id]);
  res.json({ message: 'Journal page deleted successfully' });
}));

// Letter routes
app.get('/api/projects/:id/letter', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM letters WHERE project_id = $1 ORDER BY created_at',
    [req.params.id]
  );
  res.json(result.rows);
}));

app.post('/api/projects/:id/letter', authenticateToken, asyncHandler(async (req, res) => {
  const { content, sender_name, signature } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const result = await pool.query(
    'INSERT INTO letters (project_id, content, sender_name, signature) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.params.id, content, sender_name, signature]
  );
  
  await logActivity(req.user.userId, req.params.id, 'letter_added', { sender_name }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.put('/api/letters/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { content, sender_name, signature } = req.body;
  
  const result = await pool.query(
    `UPDATE letters SET content = COALESCE($1, content), 
                           sender_name = COALESCE($2, sender_name),
                           signature = COALESCE($3, signature),
                           updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 RETURNING *`,
    [content, sender_name, signature, req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Letter not found' });
  }
  
  res.json(result.rows[0]);
}));

app.delete('/api/letters/:id', authenticateToken, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM letters WHERE id = $1', [req.params.id]);
  res.json({ message: 'Letter deleted successfully' });
}));

// Audio routes
app.get('/api/projects/:id/audio', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM audio_tracks WHERE project_id = $1 ORDER BY order_index, created_at',
    [req.params.id]
  );
  res.json(result.rows);
}));

app.post('/api/projects/:id/audio', authenticateToken, upload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { title, artist, order_index, autoplay, loop } = req.body;
  const audioUrl = req.file.path;
  
  const result = await pool.query(
    'INSERT INTO audio_tracks (project_id, url, title, artist, order_index, autoplay, loop) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [req.params.id, audioUrl, title, artist, order_index || 0, autoplay || false, loop || false]
  );
  
  await logActivity(req.user.userId, req.params.id, 'audio_added', { title }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.put('/api/audio/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { title, artist, order_index, autoplay, loop } = req.body;
  
  const result = await pool.query(
    `UPDATE audio_tracks SET title = COALESCE($1, title), 
                           artist = COALESCE($2, artist),
                           order_index = COALESCE($3, order_index),
                           autoplay = COALESCE($4, autoplay),
                           loop = COALESCE($5, loop)
     WHERE id = $6 RETURNING *`,
    [title, artist, order_index, autoplay, loop, req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Audio track not found' });
  }
  
  res.json(result.rows[0]);
}));

app.delete('/api/audio/:id', authenticateToken, asyncHandler(async (req, res) => {
  const audioResult = await pool.query(
    'SELECT url FROM audio_tracks WHERE id = $1',
    [req.params.id]
  );
  
  if (audioResult.rows.length > 0) {
    // Delete from Cloudinary
    const publicId = audioResult.rows[0].url.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(`joynest/${publicId}`, { resource_type: 'video' });
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }
  
  await pool.query('DELETE FROM audio_tracks WHERE id = $1', [req.params.id]);
  
  res.json({ message: 'Audio track deleted successfully' });
}));

// Timeline routes
app.get('/api/projects/:id/timeline', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY order_index, event_date, created_at',
    [req.params.id]
  );
  res.json(result.rows);
}));

app.post('/api/projects/:id/timeline', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, description, event_date, display_date, order_index } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  let imageUrl = null;
  if (req.file) {
    imageUrl = req.file.path;
  }
  
  const result = await pool.query(
    'INSERT INTO timeline_events (project_id, title, description, event_date, display_date, image_url, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [req.params.id, title, description, event_date, display_date, imageUrl, order_index || 0]
  );
  
  await logActivity(req.user.userId, req.params.id, 'timeline_event_added', { title }, req);
  
  res.status(201).json(result.rows[0]);
}));

app.put('/api/timeline/:id', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, description, event_date, display_date, order_index } = req.body;
  
  let updateQuery = `UPDATE timeline_events SET title = COALESCE($1, title), 
                              description = COALESCE($2, description),
                              event_date = COALESCE($3, event_date),
                              display_date = COALESCE($4, display_date),
                              order_index = COALESCE($5, order_index)`;
  const values = [title, description, event_date, display_date, order_index];
  let paramCount = 6;
  
  if (req.file) {
    updateQuery += `, image_url = $${paramCount}`;
    values.push(req.file.path);
    paramCount++;
  }
  
  updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
  values.push(req.params.id);
  
  const result = await pool.query(updateQuery, values);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Timeline event not found' });
  }
  
  res.json(result.rows[0]);
}));

app.delete('/api/timeline/:id', authenticateToken, asyncHandler(async (req, res) => {
  const eventResult = await pool.query(
    'SELECT image_url FROM timeline_events WHERE id = $1',
    [req.params.id]
  );
  
  if (eventResult.rows.length > 0 && eventResult.rows[0].image_url) {
    // Delete from Cloudinary
    const publicId = eventResult.rows[0].image_url.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(`joynest/${publicId}`);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }
  
  await pool.query('DELETE FROM timeline_events WHERE id = $1', [req.params.id]);
  
  res.json({ message: 'Timeline event deleted successfully' });
}));

// Publish route
app.post('/api/projects/:id/publish', authenticateToken, asyncHandler(async (req, res) => {
  const { password_protected, access_password } = req.body;
  const publishedUrl = `${process.env.CLIENT_URL || 'https://joynest.app'}/memories/${req.params.id}`;
  
  const result = await pool.query(
    `UPDATE projects 
     SET status = 'published', published_url = $1, password_protected = $2, access_password = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [publishedUrl, password_protected || false, access_password || null, req.params.id, req.user.userId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const project = result.rows[0];
  if (project.theme) {
    project.theme = JSON.parse(project.theme);
  }
  
  await logActivity(req.user.userId, project.id, 'project_published', { url: publishedUrl }, req);
  
  res.json(project);
}));

// Public view route (no authentication required)
app.get('/api/public/memories/:id', asyncHandler(async (req, res) => {
  const projectResult = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND status = $2',
    [req.params.id, 'published']
  );
  
  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Memory not found or not published' });
  }
  
  const project = projectResult.rows[0];
  
  // Check password protection
  if (project.password_protected) {
    const { password } = req.query;
    if (!password || password !== project.access_password) {
      return res.status(403).json({ 
        error: 'Password required',
        password_protected: true 
      });
    }
  }
  
  // Increment view count and update last visited
  await pool.query(
    'UPDATE projects SET views = views + 1, last_visited = CURRENT_TIMESTAMP WHERE id = $1',
    [req.params.id]
  );
  
  // Get all project data
  const [gallery, journal, letter, audio, timeline] = await Promise.all([
    pool.query('SELECT * FROM gallery_images WHERE project_id = $1 ORDER BY order_index, created_at', [req.params.id]),
    pool.query('SELECT * FROM journal_pages WHERE project_id = $1 ORDER BY page_number, created_at', [req.params.id]),
    pool.query('SELECT * FROM letters WHERE project_id = $1 ORDER BY created_at', [req.params.id]),
    pool.query('SELECT * FROM audio_tracks WHERE project_id = $1 ORDER BY order_index, created_at', [req.params.id]),
    pool.query('SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY order_index, event_date, created_at', [req.params.id])
  ]);
  
  if (project.theme) {
    project.theme = JSON.parse(project.theme);
  }
  
  res.json({
    project,
    gallery: gallery.rows,
    journal: journal.rows,
    letter: letter.rows,
    audio: audio.rows,
    timeline: timeline.rows
  });
}));

// Analytics route
app.get('/api/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { project_id, start_date, end_date } = req.query;
  
  let projectFilter = '';
  const params = [req.user.userId];
  let paramCount = 2;
  
  if (project_id) {
    projectFilter = `AND project_id = $${paramCount}`;
    params.push(project_id);
    paramCount++;
  }
  
  let dateFilter = '';
  if (start_date && end_date) {
    dateFilter = `AND created_at BETWEEN $${paramCount} AND $${paramCount + 1}`;
    params.push(start_date, end_date);
    paramCount += 2;
  }
  
  const activityResult = await pool.query(
    `SELECT action, COUNT(*) as count, created_at::date as date 
     FROM activity_logs 
     WHERE user_id = $1 ${projectFilter} ${dateFilter}
     GROUP BY action, created_at::date 
     ORDER BY date DESC`,
    params
  );
  
  const viewsResult = await pool.query(
    `SELECT id, title, views, last_visited 
     FROM projects 
     WHERE user_id = $1 ${projectFilter}
     ORDER BY views DESC`,
    [req.user.userId, ...(project_id ? [project_id] : [])]
  );
  
  res.json({
    activities: activityResult.rows,
    views: viewsResult.rows
  });
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 JoyNest API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: Supabase`);
    console.log(`📸 Storage: Cloudinary`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});