# JoyNest Server

Backend API for JoyNest - Memory making platform.

## Features

- User authentication (JWT)
- Project management
- Image upload
- Audio upload
- Journal pages
- Letters
- Timeline events
- Public memory sharing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets.

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/publish` - Publish project

### Gallery
- `GET /api/projects/:id/gallery` - Get gallery images
- `POST /api/projects/:id/gallery` - Upload image

### Journal
- `GET /api/projects/:id/journal` - Get journal pages
- `POST /api/projects/:id/journal` - Create journal page

### Letter
- `GET /api/projects/:id/letter` - Get letters
- `POST /api/projects/:id/letter` - Create letter

### Audio
- `GET /api/projects/:id/audio` - Get audio tracks
- `POST /api/projects/:id/audio` - Upload audio

### Timeline
- `GET /api/projects/:id/timeline` - Get timeline events
- `POST /api/projects/:id/timeline` - Create timeline event

### Public
- `GET /api/public/memories/:id` - Get published memory (no auth)

## Database Schema

The server automatically creates the following tables:
- users
- projects
- gallery_images
- journal_pages
- letters
- audio_tracks
- timeline_events