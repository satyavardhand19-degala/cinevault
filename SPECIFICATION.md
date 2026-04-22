# 📋 CineVault — Product Specification Document

**Version**: 1.0.0
**Date**: 2025
**Status**: Approved
**Owner**: Product Team

---

## 1. Product Vision

CineVault is a web-based movie information platform that provides two distinct portals:
- A **public-facing User Portal** for discovering and exploring movies and trailers
- A **protected Admin Portal** for managing all movie content

The system must be fast, visually engaging, and secure, functioning as the single source of truth for all movie data displayed to the public.

---

## 2. Stakeholders

| Stakeholder | Role | Needs |
|---|---|---|
| End Users | Public visitors | Browse, search, watch trailers |
| Admins | Content managers | Add, edit, delete movies |
| Developers | Engineering team | Clear APIs, maintainable codebase |

---

## 3. Functional Requirements

### 3.1 User Portal

#### FR-U-01: Movie Listing Page (Home)
- Display all published movies in a responsive grid
- Each card shows: poster image, title, release year, genre badge, star rating
- Default sort: Latest release date
- Pagination: 12 movies per page (with load more or numbered pagination)
- Loading skeleton screens while fetching

#### FR-U-02: Movie Detail Page
- URL pattern: `/movies/:id` or `/movies/:slug`
- Display full movie details:
  - Title, tagline, synopsis (full)
  - Release date, runtime, language, country
  - Genres (multi-tag)
  - Director, cast members (name + role)
  - Rating (aggregated 0–10 scale)
  - Poster (high-res) + banner/backdrop image
  - Trailer button (opens modal)
- "Back to Browse" navigation

#### FR-U-03: Trailer Modal / Player
- Triggered by "Watch Trailer" button on detail page
- Supports:
  - YouTube embed via URL (iframe)
  - Hosted MP4 file via Cloudinary
- Modal is dismissible via ESC key, overlay click, or close button
- Lazy-loads to improve page speed

#### FR-U-04: Search
- Real-time search bar in navbar
- Searches by: movie title, genre, director name
- Debounced API call (300ms)
- Displays results in a dropdown or dedicated search results page
- "No results found" state

#### FR-U-05: Filter & Sort
- Filter by: Genre (multi-select), Language, Release Year (range), Rating (minimum)
- Sort by: Newest, Oldest, Highest Rated, Title A–Z
- Filters persist in URL query params for shareability
- Clear all filters button

#### FR-U-06: Responsive Design
- Mobile first breakpoints: 320px, 768px, 1024px, 1440px
- Hamburger menu on mobile
- Touch-optimized trailer controls

---

### 3.2 Admin Portal

#### FR-A-01: Admin Login
- URL: `/admin/login`
- Email + password form
- JWT token issued on successful login (stored in httpOnly cookie or localStorage)
- Failed login: error message, 5 attempts lockout for 10 minutes
- "Remember me" option (30-day token)

#### FR-A-02: Admin Dashboard (Overview)
- Stats cards: Total Movies, Movies Added This Month, Total Trailers, Languages Count
- Recent activity log (last 10 actions)
- Quick action buttons: "Add New Movie"
- Table of all movies with inline action buttons

#### FR-A-03: Add Movie
- Form fields:
  - Title* (string, max 200 chars)
  - Tagline (string, max 300 chars)
  - Synopsis* (textarea, max 2000 chars)
  - Release Date* (date picker)
  - Runtime (number, minutes)
  - Language* (dropdown, multi-select)
  - Country (text)
  - Genres* (multi-select from predefined list)
  - Director* (text)
  - Cast (repeatable field: actor name + role)
  - Rating (0–10, decimal)
  - Poster Image* (file upload → Cloudinary)
  - Backdrop Image (file upload → Cloudinary)
  - Trailer URL* (YouTube URL or file upload)
  - Status (Published / Draft)
- Real-time validation with inline error messages
- Preview mode before saving
- Auto-generate slug from title

#### FR-A-04: Edit Movie
- Pre-populated form from existing record
- Change poster/backdrop triggers re-upload
- Track `updatedAt` timestamp
- Confirmation dialog on unsaved changes navigation

#### FR-A-05: Delete Movie
- Soft delete (sets `isDeleted: true`, not permanent)
- Confirmation modal: "Are you sure you want to remove [Title]?"
- Deleted movies are hidden from user portal immediately
- Restore option in admin (within 30 days)

#### FR-A-06: Admin Route Protection
- All `/admin/*` routes (except `/admin/login`) require valid JWT
- Expired token → redirect to login
- Role check: only users with `role: "admin"` can access

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time: < 2 seconds on 4G network
- API response time: < 500ms for listing, < 200ms for detail
- Images: WebP format, lazy loaded, responsive srcset
- Trailer: no autoplay, deferred load

### 4.2 Security
- All admin API endpoints protected by JWT middleware
- Input sanitization to prevent XSS and NoSQL injection
- Rate limiting: 100 requests/minute per IP on public API
- Admin API: 30 requests/minute
- HTTPS enforced in production
- Passwords hashed with bcrypt (salt rounds: 12)
- No sensitive data in client-side logs

### 4.3 Scalability
- Stateless backend (horizontal scaling ready)
- MongoDB indexes on frequently queried fields (title, genre, year)
- CDN-ready static assets (Cloudinary handles media CDN)

### 4.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader support (ARIA labels)
- Focus trap in modals

### 4.5 Browser Support
- Chrome >= 90, Firefox >= 88, Safari >= 14, Edge >= 90
- Mobile: iOS Safari 14+, Chrome Android 90+

---

## 5. Data Models

### Movie
```json
{
  "_id": "ObjectId",
  "title": "string",
  "slug": "string (unique)",
  "tagline": "string",
  "synopsis": "string",
  "releaseDate": "Date",
  "runtime": "number (minutes)",
  "language": ["string"],
  "country": "string",
  "genres": ["string"],
  "director": "string",
  "cast": [{ "actor": "string", "role": "string" }],
  "rating": "number (0–10)",
  "posterUrl": "string (Cloudinary URL)",
  "backdropUrl": "string (Cloudinary URL)",
  "trailerUrl": "string (YouTube URL or Cloudinary)",
  "trailerType": "youtube | hosted",
  "status": "published | draft",
  "isDeleted": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Admin User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "passwordHash": "string",
  "role": "admin",
  "lastLogin": "Date",
  "loginAttempts": "number",
  "lockUntil": "Date",
  "createdAt": "Date"
}
```

---

## 6. API Endpoints (Summary)

### Public (User)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies` | List all published movies |
| GET | `/api/movies/:id` | Get single movie |
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/movies/filter` | Filter + sort movies |
| GET | `/api/genres` | List all genres |

### Admin (Protected)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/admin/movies` | List all movies (incl. drafts) |
| POST | `/api/admin/movies` | Add new movie |
| PUT | `/api/admin/movies/:id` | Update movie |
| DELETE | `/api/admin/movies/:id` | Soft delete movie |
| PATCH | `/api/admin/movies/:id/restore` | Restore deleted movie |
| POST | `/api/admin/upload` | Upload media to Cloudinary |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## 7. Error Handling

| HTTP Code | Meaning | Response |
|---|---|---|
| 400 | Bad Request | Validation error details |
| 401 | Unauthorized | "Authentication required" |
| 403 | Forbidden | "Admin access required" |
| 404 | Not Found | "Movie not found" |
| 429 | Rate Limited | "Too many requests" |
| 500 | Server Error | "Internal server error" (no stack in prod) |

---

## 8. Acceptance Criteria Summary

- [ ] User can browse all published movies without login
- [ ] User can search and filter movies
- [ ] User can open and close trailer modal
- [ ] Admin can login and receive JWT
- [ ] Admin can add a movie with all required fields
- [ ] Admin can edit existing movie details
- [ ] Admin can soft-delete a movie (hidden from user portal instantly)
- [ ] All admin routes return 401 without valid JWT
- [ ] Mobile layout is usable at 375px width
- [ ] Page loads under 2 seconds on simulated 4G
