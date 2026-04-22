# 🗺️ CineVault — Project Scope Document

**Version**: 1.0.0
**Date**: 2025
**Status**: Approved

---

## 1. Project Overview

CineVault is a full-stack movie information and management web application. The project scope covers the end-to-end design, development, testing, and deployment of two portals — a public User Portal and a protected Admin Portal — over four distinct phases.

---

## 2. In Scope

### ✅ Portals
- Public User Portal (browse, search, filter, watch trailers)
- Admin Portal (login, dashboard, full CRUD for movies)

### ✅ Core Modules
- Movie listing and detail pages
- Trailer embed/playback (YouTube + hosted video)
- Search with debounce
- Genre/year/rating filter system
- Admin authentication (JWT)
- Movie CRUD (Create, Read, Update, soft Delete)
- Media upload (poster + backdrop + trailer) via Cloudinary
- Dashboard statistics panel
- Responsive design (mobile + tablet + desktop)

### ✅ Technical Infrastructure
- RESTful API (Express.js + MongoDB)
- Frontend SPA (React + Vite)
- Cloud media storage (Cloudinary)
- JWT-based authentication
- Environment-based configuration (.env)
- Production deployment on Render / Vercel / Railway

### ✅ Documentation
- README.md
- SPECIFICATION.md
- SCOPE.md
- TECH_DOC.md
- Inline code comments
- API documentation (Swagger/OpenAPI)

---

## 3. Out of Scope

### ❌ Not Included in This Version (v1.0)
- User registration / login for public users
- User reviews, ratings, or comments
- Watchlist or favorites functionality
- Email notifications or newsletters
- Multi-admin roles (e.g., editor vs super admin)
- Mobile native app (iOS / Android)
- Recommendation engine or "Related Movies" AI feature
- Payment gateway or subscription model
- Multi-language (i18n) support
- Dark/light mode toggle
- Social media OAuth login for admin
- TMDB / IMDB API integration (all data entered manually)
- Real-time collaboration for admin (multi-user editing same record)
- Analytics dashboard (Google Analytics events)

> These items are candidates for **v2.0** and beyond.

---

## 4. Phases & Milestones

---

### 🔵 Phase 1 — Foundation & Setup
**Goal**: Establish project infrastructure and base architecture.

#### Deliverables
- [ ] Repository initialized (monorepo: `/client`, `/server`)
- [ ] Git branching strategy defined (main, develop, feature/*)
- [ ] Backend: Express server running, MongoDB connected
- [ ] Frontend: Vite + React scaffolded with routing
- [ ] `.env` templates for both client and server
- [ ] Cloudinary account setup and integration config
- [ ] ESLint + Prettier configured
- [ ] Folder structure finalized
- [ ] Base README committed

#### Key Tasks
| Task | Owner | Est. Time |
|---|---|---|
| Initialize monorepo | Dev | 2h |
| Setup Express server + MongoDB | Backend Dev | 4h |
| Setup Vite + React + React Router | Frontend Dev | 3h |
| Configure Cloudinary | Backend Dev | 2h |
| Setup ESLint/Prettier | Dev | 1h |
| Design DB schema (Movie + User) | Backend Dev | 3h |
| Create Mongoose models | Backend Dev | 2h |
| Write base environment configs | Dev | 1h |

---

### 🟡 Phase 2 — Backend API Development
**Goal**: Build all REST API endpoints for public and admin use.

#### Deliverables
- [ ] Movies API (CRUD) fully functional
- [ ] Auth API (login, logout, token refresh)
- [ ] JWT middleware for route protection
- [ ] Cloudinary upload endpoint
- [ ] Rate limiting middleware
- [ ] Input validation (express-validator)
- [ ] Error handling middleware
- [ ] Search + filter query logic
- [ ] Database seed script
- [ ] Swagger/OpenAPI documentation

#### Key Tasks
| Task | Owner | Est. Time |
|---|---|---|
| Movies controller (CRUD) | Backend Dev | 6h |
| Auth controller + JWT | Backend Dev | 4h |
| Auth middleware | Backend Dev | 2h |
| Cloudinary upload handler | Backend Dev | 3h |
| Search & filter query builder | Backend Dev | 4h |
| Rate limiter setup | Backend Dev | 1h |
| Input validation layer | Backend Dev | 3h |
| Error handler middleware | Backend Dev | 2h |
| Seed script (10+ sample movies) | Backend Dev | 3h |
| Swagger docs setup | Backend Dev | 3h |

---

### 🟠 Phase 3 — Frontend Development
**Goal**: Build all user-facing and admin-facing UI components and pages.

#### 3a: User Portal 
- [ ] Navbar with search bar
- [ ] Home / Movie Listing page (grid, pagination)
- [ ] Movie Detail page
- [ ] Trailer Modal (YouTube + hosted)
- [ ] Search results page
- [ ] Filter/sort sidebar or toolbar
- [ ] Loading skeletons
- [ ] 404 / Error pages
- [ ] Fully responsive layout

#### 3b: Admin Portal 
- [ ] Admin Login page
- [ ] Protected Route HOC
- [ ] Admin Dashboard (stats + table)
- [ ] Add Movie Form (with validation)
- [ ] Edit Movie Form (pre-populated)
- [ ] Delete confirmation modal
- [ ] Media upload component (poster + trailer)
- [ ] Success/error toast notifications

#### 3c: Integration & Polish 
- [ ] Connect all pages to live API
- [ ] Handle loading, empty, and error states
- [ ] Zustand store for global state
- [ ] Axios service layer with interceptors
- [ ] JWT token auto-refresh / expiry handling
- [ ] Final responsive QA
- [ ] Animation polish (page transitions, hover effects)

#### Key Tasks
| Task | Owner | Est. Time |
|---|---|---|
| User layout + navbar | Frontend Dev | 4h |
| Movie listing page | Frontend Dev | 6h |
| Movie detail page | Frontend Dev | 5h |
| Trailer modal | Frontend Dev | 4h |
| Search component | Frontend Dev | 4h |
| Filter/sort toolbar | Frontend Dev | 5h |
| Admin login page | Frontend Dev | 3h |
| Protected route + auth store | Frontend Dev | 3h |
| Admin dashboard page | Frontend Dev | 5h |
| Add/Edit movie form | Frontend Dev | 8h |
| Media uploader component | Frontend Dev | 4h |
| API service layer | Frontend Dev | 3h |
| Loading/error/empty states | Frontend Dev | 3h |
| Toast notifications | Frontend Dev | 2h |

---

### 🟢 Phase 4 — Testing, QA & Deployment
**Goal**: Ensure quality, fix bugs, and deploy to production.

#### Deliverables
- [ ] Backend unit tests (controllers, middleware)
- [ ] API integration tests (Supertest)
- [ ] Frontend component tests (Vitest + Testing Library)
- [ ] End-to-end tests (Playwright): browse, search, admin CRUD
- [ ] Cross-browser QA (Chrome, Firefox, Safari, Edge)
- [ ] Mobile QA (375px, 768px)
- [ ] Performance audit (Lighthouse > 85 score)
- [ ] Security review (OWASP checklist)
- [ ] Production environment variables configured
- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed (Render or Railway)
- [ ] MongoDB Atlas production cluster configured
- [ ] CI/CD pipeline (GitHub Actions)

#### Key Tasks
| Task | Owner | Est. Time |
|---|---|---|
| Backend unit tests | Backend Dev | 5h |
| API integration tests | Backend Dev | 4h |
| Frontend component tests | Frontend Dev | 5h |
| E2E test suite (Playwright) | QA | 6h |
| Cross-browser testing | QA | 3h |
| Lighthouse audit + fixes | Dev | 3h |
| OWASP security checklist | Backend Dev | 2h |
| Configure Vercel deployment | Dev | 2h |
| Configure Render deployment | Dev | 2h |
| Setup GitHub Actions CI | Dev | 3h |
| Final UAT (User Acceptance Testing) | Product | 3h |
| Production smoke test | Dev | 1h |


---

## 5. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Cloudinary API rate limits during dev | Low | Medium | Use local storage mocks in dev |
| YouTube embed blocked in some regions | Medium | High | Fallback to hosted video via Cloudinary |
| Scope creep (new features mid-sprint) | High | High | Strict change control, defer to v2 backlog |
| MongoDB Atlas outage | Low | High | Regular local backups, Atlas alerts |
| JWT token vulnerabilities | Low | High | httpOnly cookies, short expiry, refresh tokens |
| Slow image loading | Medium | Medium | WebP + lazy loading + Cloudinary transformations |

---

## 6. Assumptions

- Admin users are pre-created (no self-registration for admins)
- All trailer links are YouTube URLs or directly uploaded video files
- Movie data is entered manually (no third-party API sync in v1)
- One developer handles backend, one handles frontend (or solo dev)
- Cloudinary free tier is sufficient for v1 (25GB storage, 25GB bandwidth/month)

---

## 7. Definition of Done (DoD)

A feature is considered **Done** when:
- [ ] Code is written and reviewed (PR approved)
- [ ] Unit/integration tests pass
- [ ] No console errors in browser
- [ ] Responsive on mobile and desktop
- [ ] Merged to `develop` branch
- [ ] API endpoint documented in Swagger
- [ ] Acceptance criteria from SPECIFICATION.md met
