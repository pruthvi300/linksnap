# URL Shortener - System Architecture

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      REACT FRONTEND                              │
│                         (Vite)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Components:                                             │   │
│  │  • Header (Logo, Navigation)                            │   │
│  │  • URLShortenerForm (Input, Validation)                 │   │
│  │  • URLList (Display URLs, Copy Button)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  State Management:                                       │   │
│  │  • URLs array                                           │   │
│  │  • Loading states                                       │   │
│  │  • Notifications                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ (CORS Enabled)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      FASTAPI BACKEND                             │
│                   http://localhost:8000                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Routes:                                             │   │
│  │  POST   /urls/create      → Create short URL           │   │
│  │  GET    /urls/me          → Get user's URLs            │   │
│  │  GET    /urls/{code}      → Redirect to original       │   │
│  │  POST   /auth/register    → Register user              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services:                                               │   │
│  │  • URL Service (generate_short_code)                    │   │
│  │  • Security (password hashing)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Middleware:                                             │   │
│  │  • CORS (allow localhost:5173)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ SQLAlchemy ORM
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      MYSQL DATABASE                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    users     │  │     urls     │  │    clicks    │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │         │
│  │ name         │  │ user_id (FK) │  │ url_id (FK)  │         │
│  │ email        │  │ original_url │  │ ip_address   │         │
│  │ password_hash│  │ short_code   │  │ user_agent   │         │
│  │ role         │  │ is_private   │  │ clicked_at   │         │
│  │ created_at   │  │ expires_at   │  └──────────────┘         │
│  └──────────────┘  │ click_limit  │                            │
│                    │ created_at   │                            │
│                    │ updated_at   │                            │
│                    └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Creating a Short URL

```
1. User enters URL in form
   ↓
2. React validates input
   ↓
3. POST /urls/create with JSON body
   {
     "original_url": "https://example.com/long/url",
     "custom_code": "my-link" (optional)
   }
   ↓
4. FastAPI receives request
   ↓
5. Validates URL format (Pydantic)
   ↓
6. Generates short code (if not custom)
   ↓
7. Checks if short_code exists in DB
   ↓
8. Inserts new record in urls table
   ↓
9. Returns JSON response
   {
     "id": "uuid",
     "short_code": "abc123",
     "original_url": "https://...",
     ...
   }
   ↓
10. React updates state
    ↓
11. New URL appears in list
    ↓
12. User clicks "Copy" button
    ↓
13. Clipboard API copies short URL
    ↓
14. Success notification shown
```

### Redirecting a Short URL

```
1. User visits http://localhost:8000/urls/abc123
   ↓
2. FastAPI matches route pattern
   ↓
3. Queries database for short_code="abc123"
   ↓
4. If found:
   - Records click in clicks table
   - Returns redirect response
   ↓
5. Browser redirects to original URL
```

## 🎨 Frontend Architecture

```
App.jsx (Root Component)
├── State Management
│   ├── urls: []
│   ├── loading: boolean
│   └── notification: {message, type}
│
├── Effects
│   └── useEffect → fetchUrls() on mount
│
└── Components
    ├── Header
    │   ├── Logo
    │   ├── Navigation
    │   └── Sign In Button
    │
    ├── URLShortenerForm
    │   ├── URL Input
    │   ├── Custom Code Input (optional)
    │   ├── Advanced Options Toggle
    │   ├── Submit Button
    │   └── Error Display
    │
    └── URLList
        ├── Empty State (if no URLs)
        └── URL Cards
            ├── Original URL
            ├── Short Code
            ├── Copy Button
            ├── Metadata (date, limits)
            └── Status Badge
```

## 🔐 Security Features

```
┌─────────────────────────────────────┐
│         Security Layers              │
├─────────────────────────────────────┤
│ 1. CORS Protection                  │
│    • Only localhost:5173 allowed    │
│                                     │
│ 2. Input Validation                 │
│    • Pydantic schemas               │
│    • URL format validation          │
│    • Custom code pattern check      │
│                                     │
│ 3. Password Security                │
│    • Bcrypt hashing                 │
│    • No plain text storage          │
│                                     │
│ 4. SQL Injection Prevention         │
│    • SQLAlchemy ORM                 │
│    • Parameterized queries          │
│                                     │
│ 5. Duplicate Prevention             │
│    • Unique short_code constraint   │
│    • Pre-insert validation          │
└─────────────────────────────────────┘
```

## 📊 Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│  • React 18                                         │
│  • Vite (Build tool)                                │
│  • Vanilla CSS (Custom design system)               │
│  • Fetch API (HTTP requests)                        │
│  • Clipboard API                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   BACKEND                           │
│  • FastAPI (Web framework)                          │
│  • Uvicorn (ASGI server)                            │
│  • SQLAlchemy (ORM)                                 │
│  • Pydantic (Validation)                            │
│  • Databases (Async DB)                             │
│  • Python-Jose (JWT)                                │
│  • Passlib (Password hashing)                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   DATABASE                          │
│  • MySQL 8.0                                        │
│  • InnoDB Engine                                    │
│  • UTF-8 Encoding                                   │
└─────────────────────────────────────────────────────┘
```

## 🚀 Deployment Considerations

### Development
- Frontend: Vite dev server (port 5173)
- Backend: Uvicorn with --reload (port 8000)
- Database: Local MySQL instance

### Production (Future)
```
Frontend:
  • Build: npm run build
  • Serve: Static files via Nginx/CDN
  • Environment: Production API URL

Backend:
  • Server: Gunicorn + Uvicorn workers
  • Process Manager: Supervisor/systemd
  • Reverse Proxy: Nginx
  • SSL: Let's Encrypt

Database:
  • Managed MySQL (AWS RDS, DigitalOcean)
  • Backups: Automated daily
  • Replication: Master-slave setup
```

## 📈 Scalability

```
Current Setup:
  Single server, suitable for development and small-scale use

Future Improvements:
  ┌─────────────────────────────────────┐
  │  Load Balancer                      │
  └──────────┬──────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
  ┌───▼───┐    ┌───▼───┐
  │ API 1 │    │ API 2 │  (Multiple FastAPI instances)
  └───┬───┘    └───┬───┘
      │             │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   Redis     │  (Caching layer)
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   MySQL     │  (Primary)
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   MySQL     │  (Replica - Read)
      └─────────────┘
```

## 🎯 Key Design Decisions

1. **React without state management library**
   - Simple useState for now
   - Can add Redux/Zustand later if needed

2. **Vanilla CSS over frameworks**
   - Full control over styling
   - No bundle size overhead
   - Custom design system

3. **FastAPI over Flask/Django**
   - Modern async support
   - Automatic API docs
   - Type hints and validation

4. **MySQL over PostgreSQL/MongoDB**
   - Already set up in backend
   - Relational data fits well
   - Wide hosting support

5. **Monorepo structure**
   - Frontend and backend in same repo
   - Easier development
   - Shared documentation
