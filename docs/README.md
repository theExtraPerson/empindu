# Empindu Monorepo

## 🏗️ Architecture Overview

Empindu is a production-grade artisan marketplace built with:

- **Backend**: Django 5 + django-ninja (async API)
- **Frontend**: Next.js 14 App Router (SSR, PWA)
- **Bot Layer**: python-telegram-bot 20 (webhook mode)
- **ML/AI**: OpenAI Whisper (voice transcription)
- **Database**: PostgreSQL 16 + pgvector
- **Cache/Queue**: Redis 7
- **Search**: Meilisearch
- **Admin**: Django Unfold (branded operations panel)
- **Deployment**: Railway (backend), Vercel (frontend)

## 📁 Repository Structure

```
empindu/
├── apps/
│   └── web/                    # Next.js 14 - buyer marketplace
│       ├── app/                # App Router pages
│       ├── components/         # Migrated React components
│       ├── lib/                # API clients, hooks, utils
│       └── middleware.ts       # i18n + auth
│
├── backend/
│   ├── config/                 # Django settings
│   ├── apps/                   # Django applications
│   │   ├── artisans/           # Artisan models & onboarding
│   │   ├── products/           # Product catalogue
│   │   ├── orders/             # Order lifecycle
│   │   ├── payments/           # Payment providers
│   │   ├── gifting/            # Gift commerce
│   │   ├── heritage/           # Heritage Fund ledger
│   │   ├── notifications/      # Email, WhatsApp, push
│   │   ├── telegram_bot/       # Bot webhook handlers
│   │   ├── ml/                 # Whisper, embeddings
│   │   └── search/             # Meilisearch integration
│   ├── api/                    # django-ninja endpoints
│   └── admin/                  # Unfold admin config
│
├── infrastructure/
│   ├── docker-compose.yml      # Local dev services
│   ├── Procfile                # Railway processes
│   └── railway.toml            # Railway config
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker Desktop
- Railway CLI (optional for deployment)

### Local Development Setup

```bash
# 1. Clone and enter repository
git clone <repository-url>
cd empindu

# 2. Set up backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up frontend
cd ../apps/web
npm install

# 4. Start infrastructure services
cd ../../infrastructure
docker compose up -d

# 5. Run migrations
cd ../backend
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start development servers
# Terminal 1 - Backend (port 8000)
cd backend
python manage.py runserver

# Terminal 2 - Frontend (port 3000)
cd apps/web
npm run dev

# Terminal 3 - Celery worker
cd backend
celery -A config worker --loglevel=info
```

Access points:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **Django Admin**: http://localhost:8000/admin
- **Meilisearch**: http://localhost:7700

## 🌍 Environment Variables

Create `.env` files in both `backend/` and `apps/web/`:

### Backend (.env)

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgres://empindu:pass@localhost:5432/empindu
REDIS_URL=redis://localhost:6379/0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# MTN MoMo
MTN_MOMO_API_KEY=your-momo-key
MTN_MOMO_API_USER=your-momo-user
MTN_MOMO_API_SECRET=your-momo-secret
MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
SITE_URL=http://localhost:8000

# OpenAI Whisper
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📦 Key Features

### ✨ For Buyers
- Story-first product pages with artisan narratives
- Direct artisan-to-buyer relationship
- Gift commerce flow with personalization
- International shipping (DHL Express)
- Multiple payment rails (Stripe, MTN MoMo, TON)
- Multilingual support (English/Luganda/Swahili)

### 🛠️ For Artisans
- Zero-cost onboarding via WhatsApp/Telegram
- Voice note biography transcription (Whisper AI)
- Professional digital presence
- Direct pricing power
- Real-time earnings dashboard
- Automatic mobile money payouts

### 🎯 Platform Operations
- Branded Unfold admin panel
- Heritage Fund tracking
- Empindu Certified mark management
- Impact analytics dashboard
- Automated notification system

## 🏃 Deployment

### Backend (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd apps/web
npm test
```

## 📊 Sprint Roadmap

- **Sprint 1-2**: Foundation & Architecture ✅
- **Sprint 3-4**: Core Data & API
- **Sprint 5-6**: Artisan Profile & Product Pages
- **Sprint 7-8**: Telegram Bot MVP + Whisper
- **Sprint 9-10**: Commerce & Payments
- **Sprint 11-12**: Artisan Dashboard
- **Sprint 13-24**: Advanced Features & Launch

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Submit PR with clear description
4. Code review and merge

## 📄 License

Proprietary - Empindu Platform

---

**Built with ❤️ for Ugandan artisans**  
*Thrive With Nature*
