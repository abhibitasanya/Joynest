# JoyNest(Work in progress)

A beautiful memory-making platform that lets users create interactive memory websites for birthdays, weddings, travel, and every precious moment.

## 🏗️ Project Structure

```
Joynest/
├── client/          # Frontend (React + Vite + Tailwind)
├── server/          # Backend API (Node.js + Express + PostgreSQL)
└── README.md
```

## 🚀 Features

### Frontend
- Beautiful landing page with animations
- User authentication
- Dashboard for project management
- Memory editor with:
  - Image gallery
  - Interactive journal
  - Letters
  - Background music
  - Timeline
- Template selection
- Theme customization
- Publishing and sharing

### Backend
- RESTful API
- JWT authentication
- PostgreSQL database
- File upload (images, audio)
- Public memory sharing

## 📦 Tech Stack

**Frontend:**
- React 19
- Vite 8
- Tailwind CSS v4
- TypeScript

**Backend:**
- Node.js
- Express
- PostgreSQL
- JWT authentication
- Multer (file uploads)

## 🛠️ Setup

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database URL
npm start
```

## 🌐 Deployment

### Frontend (Render Static Site)
- Root directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`

### Backend (Render Web Service)
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

### Database (Render PostgreSQL)
- Create PostgreSQL instance
- Add DATABASE_URL to environment variables

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
PORT=5000
NODE_ENV=production
CLIENT_URL=your-frontend-url
```

## 📝 API Documentation

See `server/README.md` for detailed API endpoints.

## 🎨 Design Philosophy

JoyNest is designed with a warm, nostalgic aesthetic featuring:
- Soft, muted color palette
- Elegant typography
- Smooth animations
- Interactive elements
- Responsive design

## 📄 License

ISC
