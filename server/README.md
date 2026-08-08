# JoyNest Server

Backend API for JoyNest - Memory making platform.

## Features

- **User Authentication**: JWT-based signup, login, profile management
- **Project Management**: Full CRUD operations for memory projects
- **Template System**: Pre-built templates with themes and customization
- **Media Upload**: Image, audio, and video file uploads with multer
- **Journal System**: Multi-page journal with custom styling
- **Letters**: Personal letters with signatures
- **Audio Tracks**: Background music and voice notes with playlist controls
- **Timeline**: Chronological events with images and dates
- **Password Protection**: Optional password protection for published memories
- **Analytics**: Activity logging and view tracking
- **Public Sharing**: Published memories accessible via public URLs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string (min 32 characters)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health & System
- `GET /api/health` - Health check and server status

### Templates
- `GET /api/templates` - Get all templates (optional: ?category=birthday)
- `GET /api/templates/:id` - Get specific template

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile (avatar upload)

### Projects
- `GET /api/projects` - Get all user projects (optional: ?status=published&search=query)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/publish` - Publish project

### Gallery Images
- `GET /api/projects/:id/gallery` - Get gallery images
- `POST /api/projects/:id/gallery` - Upload image
- `PUT /api/gallery/:id` - Update image details
- `DELETE /api/gallery/:id` - Delete image

### Journal Pages
- `GET /api/projects/:id/journal` - Get journal pages
- `POST /api/projects/:id/journal` - Create journal page
- `PUT /api/journal/:id` - Update journal page
- `DELETE /api/journal/:id` - Delete journal page

### Letters
- `GET /api/projects/:id/letter` - Get letters
- `POST /api/projects/:id/letter` - Create letter
- `PUT /api/letters/:id` - Update letter
- `DELETE /api/letters/:id` - Delete letter

### Audio Tracks
- `GET /api/projects/:id/audio` - Get audio tracks
- `POST /api/projects/:id/audio` - Upload audio
- `PUT /api/audio/:id` - Update audio track
- `DELETE /api/audio/:id` - Delete audio track

### Timeline Events
- `GET /api/projects/:id/timeline` - Get timeline events
- `POST /api/projects/:id/timeline` - Create timeline event (with image)
- `PUT /api/timeline/:id` - Update timeline event (with image)
- `DELETE /api/timeline/:id` - Delete timeline event

### Analytics
- `GET /api/analytics` - Get user analytics (optional: ?project_id=&start_date=&end_date=)

### Public Access
- `GET /api/public/memories/:id` - Get published memory (no auth, optional: ?password=)

## Database Schema

The server automatically creates the following tables:

### Core Tables
- **users**: User accounts with authentication
- **projects**: Memory projects with settings and themes
- **templates**: Pre-built templates with themes

### Content Tables
- **gallery_images**: Image gallery with captions and ordering
- **journal_pages**: Journal pages with custom styling
- **letters**: Personal letters with signatures
- **audio_tracks**: Audio files with playlist controls
- **timeline_events**: Timeline events with dates and images

### System Tables
- **activity_logs**: User activity tracking for analytics

## File Upload

- **Max file size**: 25MB
- **Supported formats**: 
  - Images: JPEG, PNG, GIF, WebP
  - Audio: MP3, WAV, M4A
  - Video: MP4, MOV
- **Storage**: Local filesystem in `/uploads` directory
- **URL structure**: `/uploads/filename`

## Security Features

- JWT authentication with 7-day expiration
- Password hashing with bcrypt
- CORS configuration
- File type validation
- SQL injection prevention (parameterized queries)
- Activity logging for audit trail
- Password protection for published memories

## Development

The server includes:
- Auto-reload in development mode
- Detailed error logging
- Request/response logging
- Database connection pooling
- Graceful error handling