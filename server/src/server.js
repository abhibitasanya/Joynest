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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and audio files are allowed'));
  }
});

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        recipient VARCHAR(255),
        occasion VARCHAR(255),
        template VARCHAR(50),
        theme VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        published_url VARCHAR(255),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        caption TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        page_number INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        sender_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audio_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        title VARCHAR(255),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JoyNest API is running' });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Project routes
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title, recipient, occasion, template, theme } = req.body;
    
    const result = await pool.query(
      `INSERT INTO projects (user_id, title, recipient, occasion, template, theme) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.userId, title, recipient, occasion, template, theme]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { title, recipient, occasion, template, theme, status } = req.body;
    
    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, recipient = $2, occasion = $3, template = $4, theme = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, recipient, occasion, template, theme, status, req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Gallery routes
app.get('/api/projects/:id/gallery', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gallery_images WHERE project_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects/:id/gallery', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { caption } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const result = await pool.query(
      'INSERT INTO gallery_images (project_id, url, caption) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, imageUrl, caption]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Journal routes
app.get('/api/projects/:id/journal', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM journal_pages WHERE project_id = $1 ORDER BY page_number',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects/:id/journal', authenticateToken, async (req, res) => {
  try {
    const { content, page_number } = req.body;
    
    const result = await pool.query(
      'INSERT INTO journal_pages (project_id, content, page_number) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, content, page_number || 1]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Letter routes
app.get('/api/projects/:id/letter', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM letters WHERE project_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get letter error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects/:id/letter', authenticateToken, async (req, res) => {
  try {
    const { content, sender_name } = req.body;
    
    const result = await pool.query(
      'INSERT INTO letters (project_id, content, sender_name) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, content, sender_name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create letter error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Audio routes
app.get('/api/projects/:id/audio', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audio_tracks WHERE project_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects/:id/audio', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { title } = req.body;
    const audioUrl = `/uploads/${req.file.filename}`;
    
    const result = await pool.query(
      'INSERT INTO audio_tracks (project_id, url, title) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, audioUrl, title]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload audio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Timeline routes
app.get('/api/projects/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/projects/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, order_index } = req.body;
    
    const result = await pool.query(
      'INSERT INTO timeline_events (project_id, title, description, date, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, title, description, date, order_index || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create timeline event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish route
app.post('/api/projects/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const publishedUrl = `https://joynest.app/memories/${req.params.id}`;
    
    const result = await pool.query(
      `UPDATE projects 
       SET status = 'published', published_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [publishedUrl, req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Publish project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public view route (no authentication required)
app.get('/api/public/memories/:id', async (req, res) => {
  try {
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND status = $2',
      [req.params.id, 'published']
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    const project = projectResult.rows[0];
    
    // Increment view count
    await pool.query(
      'UPDATE projects SET views = views + 1 WHERE id = $1',
      [req.params.id]
    );
    
    // Get all project data
    const [gallery, journal, letter, audio, timeline] = await Promise.all([
      pool.query('SELECT * FROM gallery_images WHERE project_id = $1 ORDER BY order_index', [req.params.id]),
      pool.query('SELECT * FROM journal_pages WHERE project_id = $1 ORDER BY page_number', [req.params.id]),
      pool.query('SELECT * FROM letters WHERE project_id = $1', [req.params.id]),
      pool.query('SELECT * FROM audio_tracks WHERE project_id = $1 ORDER BY order_index', [req.params.id]),
      pool.query('SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY order_index', [req.params.id])
    ]);
    
    res.json({
      project,
      gallery: gallery.rows,
      journal: journal.rows,
      letter: letter.rows,
      audio: audio.rows,
      timeline: timeline.rows
    });
  } catch (error) {
    console.error('Get public memory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`JoyNest API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});