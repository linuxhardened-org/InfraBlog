# LinuxHardened

A production-ready blogging platform built with modern technologies. Think WordPress, but faster and developer-friendly.

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + TypeScript + Fastify |
| Frontend | Next.js 15 (React 19, App Router, SSR) |
| Database | PostgreSQL 16 (Supabase compatible) |
| ORM | Prisma |
| Cache | Redis 7 |
| Styling | TailwindCSS v4 |
| DevOps | Docker + Nginx |
| Auth | JWT + argon2 + RBAC |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)

### Option 1: Docker (Production-like)

```bash
# Clone and start
cp .env.example .env
docker compose up --build
```

Open `http://localhost` — blog is live!

### Option 2: Local Development

```bash
# Start PostgreSQL & Redis
docker compose up postgres redis -d

# Backend
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
# API at http://localhost:3001
# Swagger docs at http://localhost:3001/api/docs

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Blog at http://localhost:3000
```

### Option 3: Supabase (cloud PostgreSQL)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your connection strings to `.env`:
```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```
3. Run migrations: `cd backend && npx prisma migrate dev`

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@infrablog.com | admin123456 |
| Editor | editor@infrablog.com | editor123456 |
| Author | author@infrablog.com | author123456 |

## 📁 Project Structure

```
├── backend/                 # Fastify API
│   ├── src/
│   │   ├── config/          # DB, Redis, env config
│   │   ├── plugins/         # JWT auth, RBAC
│   │   ├── modules/         # auth, posts, categories, tags,
│   │   │                    # comments, users, media, pages, seo
│   │   ├── utils/           # helpers
│   │   └── server.ts        # Entry point
│   └── prisma/              # Schema + seed
├── frontend/                # Next.js App
│   └── src/
│       ├── app/
│       │   ├── (blog)/      # Public pages
│       │   └── admin/       # Dashboard
│       ├── components/      # blog + admin + shared
│       └── lib/             # API client, utils
├── nginx/                   # Reverse proxy
├── docker-compose.yml
└── .env.example
```

## ✨ Features

### Public Blog
- SEO optimized (meta tags, OG, JSON-LD schema)
- Blog list with pagination, category/tag filters
- Post detail: table of contents, syntax highlighting, social sharing
- Responsive dark/light mode
- Search with debounced input
- RSS feed, sitemap.xml, robots.txt

### Admin Dashboard
- JWT auth with RBAC (Admin, Editor, Author)
- Post CRUD with Markdown editor + live preview
- Draft / Publish / Schedule workflows
- Category & tag management
- Media upload with image optimization (sharp)
- Comment moderation (approve/spam/delete)
- User management with role assignment
- Static pages management
- Dashboard stats overview

### API
- REST API with Swagger docs at `/api/docs`
- Rate limiting (100 req/min)
- Zod input validation
- Redis caching with auto-invalidation

### Security
- argon2 password hashing
- Helmet security headers
- CORS protection
- Rate limiting
- Input validation & sanitization

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/posts | List posts |
| GET | /api/posts/:slug | Get post |
| GET | /api/categories | List categories |
| GET | /api/tags | List tags |
| POST | /api/comments | Submit comment |
| GET | /api/sitemap.xml | Sitemap |
| GET | /api/feed.xml | RSS feed |
| GET | /api/admin/stats | Dashboard stats |
| `CRUD` | /api/admin/* | Admin endpoints |

## 🔧 Environment Variables

See `.env.example` for all configuration options.

## 📄 License

MIT
