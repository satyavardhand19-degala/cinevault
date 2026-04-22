# ⚙️ CineVault — Technical Documentation

**Version**: 1.0.0
**Date**: 2025
**Type**: Architecture & Developer Reference

---

## 1. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│                                                             │
│   ┌──────────────────┐      ┌──────────────────────────┐   │
│   │   User Portal    │      │    Admin Portal           │   │
│   │  (React SPA)     │      │  (React SPA - Protected)  │   │
│   └────────┬─────────┘      └────────────┬─────────────┘   │
│            │                             │                  │
└────────────┼─────────────────────────────┼──────────────────┘
             │  HTTPS + REST API           │  HTTPS + JWT
             ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js API Server                       │
│                                                             │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │  Movie API  │  │   Auth API   │  │   Upload API    │  │
│   │  (public)   │  │  (admin JWT) │  │  (Cloudinary)   │  │
│   └──────┬──────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                │                    │            │
└──────────┼────────────────┼────────────────────┼────────────┘
           │                │                    │
           ▼                ▼                    ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  MongoDB     │  │  MongoDB     │  │  Cloudinary  │
    │  (Movies)    │  │  (Users)     │  │  (CDN Media) │
    └──────────────┘  └──────────────┘  └──────────────┘
```

### Request Lifecycle (User — Browse Movies)
```
Browser → GET /api/movies?page=1&genre=Action
        → Express Router
        → Rate Limiter Middleware
        → Movie Controller → movieService.getMovies()
        → Mongoose Query → MongoDB Atlas
        → Response: { movies: [...], total, page }
        → React renders MovieGrid
```

### Request Lifecycle (Admin — Add Movie)
```
Admin Form Submit → POST /api/admin/movies
                  → Express Router
                  → JWT Auth Middleware (verifyToken)
                  → Role Check Middleware (requireAdmin)
                  → Input Validation (express-validator)
                  → Movie Controller → movieService.create()
                  → Mongoose .save() → MongoDB Atlas
                  → Response: { movie, message }
                  → Toast notification in Admin UI
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI library |
| Vite | 5.x | Build tool + dev server |
| React Router DOM | 6.x | Client-side routing |
| Zustand | 4.x | Global state management |
| Axios | 1.x | HTTP client with interceptors |
| React Query (TanStack) | 5.x | Server state, caching, refetching |
| React Hook Form | 7.x | Form state + validation |
| Zod | 3.x | Schema validation (forms + API) |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations and transitions |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18.x LTS | Runtime |
| Express.js | 4.x | Web framework |
| MongoDB | 6.x | Primary database |
| Mongoose | 8.x | ODM for MongoDB |
| JSON Web Token (jsonwebtoken) | 9.x | Auth tokens |
| bcryptjs | 2.x | Password hashing |
| express-validator | 7.x | Request validation |
| express-rate-limit | 7.x | Rate limiting |
| cors | 2.x | CORS headers |
| helmet | 7.x | Security headers |
| morgan | 1.x | HTTP request logging |
| multer | 1.x | File upload handling |
| cloudinary | 2.x | Cloud media SDK |
| swagger-jsdoc + swagger-ui-express | latest | API docs |
| dotenv | 16.x | Environment variables |

### DevOps & Tooling
| Tool | Purpose |
|---|---|
| GitHub Actions | CI/CD pipeline |
| Vercel | Frontend deployment |
| Render / Railway | Backend deployment |
| MongoDB Atlas | Cloud database |
| Cloudinary | Media CDN |
| Vitest | Frontend unit tests |
| Testing Library | Component tests |
| Playwright | End-to-end tests |
| Supertest | API integration tests |
| ESLint + Prettier | Code quality |

---

## 3. Database Design

### Collection: `movies`

```javascript
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tagline: {
    type: String,
    maxlength: 300
  },
  synopsis: {
    type: String,
    required: true,
    maxlength: 2000
  },
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number, // in minutes
    min: 1
  },
  language: [{
    type: String
  }],
  country: String,
  genres: [{
    type: String,
    enum: ['Action','Comedy','Drama','Horror','Sci-Fi','Thriller',
           'Romance','Animation','Documentary','Fantasy','Mystery',
           'Adventure','Crime','Biography','Musical','Western']
  }],
  director: {
    type: String,
    required: true
  },
  cast: [{
    actor: { type: String, required: true },
    role: { type: String }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  posterUrl: {
    type: String,
    required: true  // Cloudinary URL
  },
  backdropUrl: String,
  trailerUrl: {
    type: String,
    required: true
  },
  trailerType: {
    type: String,
    enum: ['youtube', 'hosted'],
    default: 'youtube'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true // adds createdAt, updatedAt
});

// Indexes
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' }); // full-text
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ status: 1, isDeleted: 1 });
movieSchema.index({ slug: 1 });
```

### Collection: `admins`

```javascript
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin']
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});
```

---

## 4. API Reference

### Base URL
```
Development:  http://localhost:5000/api
Production:   https://api.cinevault.com/api
```

### Authentication
All admin endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 4.1 Public Movie Endpoints

#### `GET /movies`
Returns paginated list of published movies.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |
| sort | string | `-releaseDate` | Sort field (prefix `-` for desc) |
| genre | string | - | Filter by genre |
| language | string | - | Filter by language |
| yearFrom | number | - | Release year from |
| yearTo | number | - | Release year to |
| minRating | number | - | Minimum rating |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "title": "Interstellar",
        "slug": "interstellar",
        "synopsis": "...",
        "releaseDate": "2014-11-07",
        "runtime": 169,
        "genres": ["Sci-Fi", "Drama"],
        "director": "Christopher Nolan",
        "rating": 8.7,
        "posterUrl": "https://res.cloudinary.com/.../poster.webp",
        "trailerUrl": "https://youtube.com/watch?v=zSWdZVtXT7E",
        "trailerType": "youtube",
        "language": ["English"],
        "status": "published"
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "limit": 12,
      "totalPages": 4
    }
  }
}
```

---

#### `GET /movies/:id`
Returns single movie by ID or slug.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Interstellar",
    "cast": [
      { "actor": "Matthew McConaughey", "role": "Cooper" }
    ],
    ...fullMovieObject
  }
}
```

**Response `404`:**
```json
{ "success": false, "error": "Movie not found" }
```

---

#### `GET /movies/search?q=inception`
Full-text search.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "results": [...],
    "total": 3,
    "query": "inception"
  }
}
```

---

#### `GET /genres`
Returns list of all genres used by published movies.

**Response `200`:**
```json
{
  "success": true,
  "data": ["Action", "Comedy", "Drama", "Sci-Fi", "Thriller"]
}
```

---

### 4.2 Admin Auth Endpoints

#### `POST /auth/login`
**Body:**
```json
{ "email": "admin@cinevault.com", "password": "Admin@123" }
```
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": { "_id": "...", "name": "Admin", "email": "admin@cinevault.com" },
    "expiresIn": 86400
  }
}
```
**Response `401`:**
```json
{ "success": false, "error": "Invalid credentials" }
```

---

### 4.3 Admin Movie Endpoints

#### `POST /admin/movies`
**Headers:** `Authorization: Bearer <token>`
**Body (multipart/form-data):**
```
title, tagline, synopsis, releaseDate, runtime, language[],
genres[], director, cast[], rating, status,
poster (file), backdrop (file), trailerUrl, trailerType
```
**Response `201`:**
```json
{ "success": true, "data": { ...newMovie }, "message": "Movie created successfully" }
```

---

#### `PUT /admin/movies/:id`
Same body as POST. Returns updated movie.

---

#### `DELETE /admin/movies/:id`
Soft deletes. Returns `{ success: true, message: "Movie removed" }`.

---

#### `PATCH /admin/movies/:id/restore`
Restores soft-deleted movie.

---

#### `POST /admin/upload`
Upload single media file to Cloudinary.
**Body:** `multipart/form-data` with `file` field, optional `type: poster|backdrop|trailer`
**Response:**
```json
{ "success": true, "data": { "url": "https://res.cloudinary.com/...", "publicId": "..." } }
```

---

#### `GET /admin/stats`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalMovies": 48,
    "publishedMovies": 43,
    "draftMovies": 5,
    "addedThisMonth": 6,
    "totalLanguages": 8,
    "genreBreakdown": { "Action": 12, "Drama": 10, ... }
  }
}
```

---

## 5. Frontend Architecture

### Routing Structure

```
/ (App.jsx)
├── / → <Home /> (Movie Listing)
├── /movies/:slug → <MovieDetail />
├── /search?q= → <SearchResults />
│
└── /admin
    ├── /admin/login → <AdminLogin /> [PUBLIC]
    ├── /admin/dashboard → <Dashboard /> [PROTECTED]
    ├── /admin/movies/new → <AddMovie /> [PROTECTED]
    ├── /admin/movies/:id/edit → <EditMovie /> [PROTECTED]
    └── * → <AdminNotFound />
```

### Protected Route Implementation

```jsx
// routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { token, isTokenValid } = useAuthStore();
  
  if (!token || !isTokenValid()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
```

### State Management (Zustand)

```javascript
// store/authStore.js
const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('adminToken') || null,
  admin: null,
  
  login: (token, admin) => {
    localStorage.setItem('adminToken', token);
    set({ token, admin });
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ token: null, admin: null });
  },
  
  isTokenValid: () => {
    const { token } = get();
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < exp * 1000;
    } catch { return false; }
  }
}));
```

### Axios Instance with Interceptors

```javascript
// services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Authentication Flow

```
Admin enters email + password
        ↓
POST /api/auth/login
        ↓
Server: find admin by email
Server: bcrypt.compare(password, hash)
        ↓
  [FAIL] → 401, increment loginAttempts
  [PASS] → generate JWT (24h expiry)
        ↓
Client: store token in localStorage
Client: Zustand authStore.login(token, admin)
        ↓
Navigate to /admin/dashboard
        ↓
All subsequent admin API requests:
  → Axios interceptor adds Bearer token
  → Server JWT middleware verifies
  → Route handler executes
```

---

## 7. Media Upload Flow (Cloudinary)

```
Admin selects poster image in form
        ↓
React: FileReader → base64 preview shown instantly
        ↓
On form submit:
  → FormData with file
  → POST /api/admin/upload (multipart)
        ↓
Server: multer parses file from request
Server: cloudinary.uploader.upload(file, options)
        ↓
Cloudinary returns: { secure_url, public_id }
        ↓
Server returns URL to client
Client: stores URL in form state
        ↓
On movie save: URL included in movie document
```

**Cloudinary Configuration:**
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload options
const options = {
  folder: 'cinevault/posters',
  transformation: [
    { width: 500, height: 750, crop: 'fill', gravity: 'auto' },
    { format: 'webp', quality: 'auto' }
  ]
};
```

---

## 8. Trailer Embed Logic

```jsx
// components/user/TrailerModal.jsx
function TrailerModal({ trailerUrl, trailerType, title, onClose }) {
  const getEmbedUrl = (url) => {
    if (trailerType === 'youtube') {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      )?.[1];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return url; // hosted MP4
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {trailerType === 'youtube' ? (
          <iframe
            src={getEmbedUrl(trailerUrl)}
            title={`${title} Trailer`}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : (
          <video controls autoPlay src={trailerUrl} />
        )}
      </div>
    </div>
  );
}
```

---

## 9. Security Implementation

### JWT Middleware
```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Helmet Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube-nocookie.com"],
      imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"]
    }
  }
}));
```

### Rate Limiting
```javascript
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests' }
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30
});

app.use('/api/movies', publicLimiter);
app.use('/api/admin', adminLimiter);
```

---

## 10. Environment Variables Reference

### Server `/server/.env`
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cinevault

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=86400

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Client `/client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD=your_cloud
```

---

## 11. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd server && npm ci
      - run: cd server && npm test
      
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd client && npm ci
      - run: cd client && npm run build
      - run: cd client && npm test

  deploy:
    needs: [backend-test, frontend-test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Backend to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 12. Deployment Architecture

```
GitHub (main branch)
        ↓
GitHub Actions CI
  ├── Run tests
  ├── Build frontend
  └── Deploy
        ├── Vercel (Frontend SPA)
        │     └── cinevault.vercel.app
        └── Render (Express API)
              └── api.cinevault.com
                    └── MongoDB Atlas (Cloud DB)
                    └── Cloudinary (Media CDN)
```

---

## 13. Performance Optimizations

| Area | Strategy |
|---|---|
| Images | WebP format, Cloudinary auto-quality, lazy loading |
| Fonts | Google Fonts with `font-display: swap` |
| API | React Query caching (5min stale time for listings) |
| Code splitting | React.lazy() + Suspense for admin bundle |
| MongoDB | Compound indexes on (status, isDeleted, releaseDate) |
| Search | Text index for full-text search, debounce on client |
| Pagination | Cursor-based pagination option for large datasets |

---

## 14. Testing Strategy

| Type | Tool | Coverage Target |
|---|---|---|
| Unit (Backend) | Jest + Supertest | Controllers, middleware, utils |
| Unit (Frontend) | Vitest + Testing Library | Components, hooks, store |
| Integration | Supertest + MongoDB Memory Server | API endpoints |
| E2E | Playwright | Browse flow, search, admin CRUD |

### Key E2E Scenarios
1. User browses home → clicks movie → opens trailer → closes
2. User searches "Nolan" → sees results → clicks movie
3. Admin logs in → adds movie → verifies appears in user portal
4. Admin edits movie title → verifies change in user portal
5. Admin deletes movie → verifies hidden from user portal
6. Unauthenticated access to `/admin/dashboard` → redirect to login
