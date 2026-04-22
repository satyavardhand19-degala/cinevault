# 🎬 CineVault — Movie Information & Management Platform

> A full-stack web application for browsing, discovering, and managing movie details and trailers — with a dedicated Admin Dashboard for content management.

---

## 📌 Overview

**CineVault** is a two-portal web platform:
- **User Portal** — Browse movies, view detailed information, and watch trailers.
- **Admin Portal** — Authenticated dashboard to add, edit, and manage movie records.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x or yarn >= 1.22
- MongoDB Atlas account (or local MongoDB >= 6.x)
- Cloudinary account (for media storage)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/cinevault.git
cd cinevault
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `.env` in `/server`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cinevault
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
```

Create `.env` in `/client`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD=your_cloud_name
```

### 4. Seed the Database (Optional)
```bash
cd server
npm run seed
```

### 5. Run the Application
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- **User App**: http://localhost:3000
- **Admin App**: http://localhost:3000/admin
- **API Docs**: http://localhost:5000/api-docs

---

## 📁 Project Structure

```
cinevault/
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/              # Home, MovieDetail, Browse, Search
│   │   │   └── admin/             # Login, Dashboard, AddMovie, EditMovie
│   │   ├── components/
│   │   │   ├── ui/                # Shared UI components
│   │   │   ├── user/              # MovieCard, TrailerModal, HeroBanner
│   │   │   └── admin/             # MovieForm, DataTable, MediaUploader
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── store/                 # Zustand state management
│   │   ├── services/              # Axios API service layer
│   │   ├── routes/                # React Router config + ProtectedRoute
│   │   └── utils/                 # Helpers, validators, formatters
│   └── public/
│
├── server/                        # Express.js Backend
│   ├── controllers/               # Route logic (movies, auth, upload)
│   ├── models/                    # Mongoose schemas
│   ├── routes/                    # API route definitions
│   ├── middleware/                 # Auth, error handler, rate limiter
│   ├── config/                    # DB connection, Cloudinary config
│   ├── utils/                     # Token helpers, validators
│   └── seed/                      # Database seed scripts
│
├── docs/                          # Project documentation
│   ├── README.md
│   ├── SPECIFICATION.md
│   ├── SCOPE.md
│   └── TECH_DOC.md
│
└── docker-compose.yml             # Optional Docker setup
```

---

## 👤 User Features

| Feature | Description |
|---|---|
| Browse Movies | Grid/List view with pagination |
| Movie Detail | Full page with cast, synopsis, rating, genre |
| Trailer Player | Embedded YouTube/MP4 trailer modal |
| Search | Real-time search by title, genre, year |
| Filter & Sort | Filter by genre, language, year; sort by rating |
| Responsive UI | Fully mobile-optimized |

---

## 🔐 Admin Features

| Feature | Description |
|---|---|
| Secure Login | JWT-based admin authentication |
| Dashboard | Stats overview (total movies, latest additions) |
| Add Movie | Form with media upload (poster, trailer URL) |
| Edit Movie | Modify any movie detail inline |
| Delete Movie | Soft delete with confirmation |
| Protected Routes | All admin routes require valid JWT |

---

## 🔑 Default Admin Credentials (Dev Only)
```
Email:    admin@cinevault.com
Password: Admin@123
```
> ⚠️ Change credentials immediately in production.

---

## 🧪 Running Tests
```bash
# Backend unit + integration tests
cd server && npm test

# Frontend component tests
cd client && npm test

# E2E Tests (Playwright)
npm run test:e2e
```

---

## 📦 Build for Production
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

---

## 🐳 Docker (Optional)
```bash
docker-compose up --build
```

---

## 📄 License
MIT License © 2025 CineVault Team

---

## 🤝 Contributing
1. Fork the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request
