# Empindu Migration Guide
## From React SPA to Django + Next.js Production Platform

**Document Version**: 1.0  
**Date**: March 19, 2026  
**Status**: Foundation Complete (Sprint 2)

---

## 🎯 Executive Summary

This document provides the complete migration path from the existing Lovable-hosted React SPA to a production-grade Django + Next.js monorepo architecture with Whisper AI voice onboarding and Telegram bot integration.

### What's Been Completed ✅

1. **Monorepo Structure**: Backend (`/backend`) + Frontend (`/apps/web`)
2. **Django 5 Setup**: Unfold admin, ASGI config, settings architecture
3. **Core Data Models**: 
   - Artisan, CraftTradition, Certification
   - Product, ProductPhoto, ProvenanceRecord
   - Order, GiftDetails, GiftOrder
   - HeritageFundEntry, Distribution
4. **API Layer**: django-ninja endpoints for artisans and products
5. **Infrastructure**: Docker Compose for local dev, Railway config

### What's Next 📋

- **Sprint 3-4**: Migrate existing React components to Next.js
- **Sprint 5-6**: Implement SSR artisan/product pages
- **Sprint 7-8**: Telegram bot + Whisper integration
- **Sprint 9-10**: Full commerce + payments

---

## 📁 Current File Structure

```
empindu/
├── backend/                    # ✅ COMPLETE
│   ├── config/                 # Django settings, ASGI, URLs
│   ├── apps/                   # Django applications
│   │   ├── artisans/           # Models, admin
│   │   ├── products/           # Models, admin
│   │   ├── orders/             # Models
│   │   ├── gifting/            # Models
│   │   └── heritage/           # Impact tracking
│   ├── api/v1/                 # django-ninja endpoints
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
│
├── apps/                       # ⏳ TO BE MIGRATED
│   └── web/                    # Next.js 14 (from src/)
│
├── infrastructure/
│   └── docker-compose.yml      # Local dev services
│
├── src/                        # ⚠️ CURRENT React SPA (to migrate)
│   ├── components/             # Preserve all UI components
│   ├── pages/                  # Migrate to app/ router
│   ├── hooks/                  # Convert to Next.js hooks
│   └── integrations/supabase/  # Replace with Django API calls
│
└── README.md                   # ✅ Updated
```

---

## 🔄 Migration Strategy

### Phase 1: Component Preservation (Sprint 3)

**Goal**: Move all existing React components to Next.js without visual changes

#### Step 1: Initialize Next.js App

```bash
cd apps/web
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

#### Step 2: Install Preserved Dependencies

```bash
npm install framer-motion gsap @gsap/react
npm install @tanstack/react-query zustand next-intl
npm install @twa-dev/sdk next-pwa
npx shadcn@latest init
```

#### Step 3: Migrate Components

Copy from `src/` to `apps/web/components/`:

```bash
# Directory mapping
src/components/ui/          → apps/web/components/ui/
src/components/layout/      → apps/web/components/layout/
src/components/sections/    → apps/web/components/sections/
src/components/products/    → apps/web/components/product/
src/components/artisans/    → apps/web/components/artisan/
src/components/cart/        → apps/web/components/commerce/
src/components/gifting/     → apps/web/components/gifting/
```

**Critical**: Add `'use client'` directive to components using:
- `useState`, `useEffect`
- Framer Motion animations
- GSAP animations
- Event handlers (onClick, onChange, etc.)

#### Step 4: Update API Calls

Replace Supabase calls with Django API client:

```typescript
// BEFORE (Supabase)
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('status', 'active');

// AFTER (Django API)
const res = await fetch(`${API_BASE}/products/`, {
  next: { revalidate: 300 }
});
const data = await res.json();
```

Create API client in `apps/web/lib/api/`:

```typescript
// apps/web/lib/api/products.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export async function listProducts(params: {...}) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/products?${qs}`, {
    next: { revalidate: 300 }
  });
  return res.json();
}
```

### Phase 2: Server-Side Rendering (Sprint 5-6)

**Goal**: Convert key pages to SSR for SEO and performance

#### Artisan Profile Page Example

```typescript
// apps/web/app/artisan/[slug]/page.tsx
import { getArtisan } from '@/lib/api/artisans';
import { ArtisanHero } from '@/components/artisan/ArtisanHero';

export async function generateMetadata({ params }) {
  const artisan = await getArtisan(params.slug);
  return {
    title: `${artisan.full_name} — ${artisan.craft_tradition} | Empindu`,
    description: artisan.bio.substring(0, 155),
  };
}

export default async function ArtisanPage({ params }) {
  const artisan = await getArtisan(params.slug);
  
  return (
    <main>
      <ArtisanHero artisan={artisan} />
      {/* More sections */}
    </main>
  );
}
```

### Phase 3: Bot + Whisper Integration (Sprint 7-8)

**Already designed** - implementation files ready in strategy document:
- `backend/apps/telegram_bot/bot.py`
- `backend/apps/ml/whisper_service.py`
- `backend/apps/ml/tasks.py`

---

## 🛠️ Development Workflow

### Local Development

```bash
# Terminal 1: Start infrastructure
cd infrastructure
docker compose up -d

# Terminal 2: Backend (port 8000)
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python manage.py runserver

# Terminal 3: Frontend (port 3000)
cd apps/web
npm run dev

# Terminal 4: Celery worker
cd backend
celery -A config worker --loglevel=info
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **Django Admin**: http://localhost:8000/admin
- **Meilisearch**: http://localhost:7700

---

## 📊 Data Migration from Supabase

### Export Supabase Data

```sql
-- Export artisans
COPY artisans TO '/tmp/artisans.csv' CSV HEADER;

-- Export products
COPY products TO '/tmp/products.csv' CSV HEADER;

-- Export orders
COPY orders TO '/tmp/orders.csv' CSV HEADER;
```

### Import into Django

Create management command `backend/apps/artisans/management/commands/import_supabase_data.py`:

```python
from django.core.management.base import BaseCommand
import csv

class Command(BaseCommand):
    def handle(self, *args, **options):
        with open('/tmp/artisans.csv') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Create Artisan records
                pass
```

---

## 🚀 Deployment

### Backend (Railway)

```bash
cd backend
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- `DJANGO_SECRET_KEY`
- `DATABASE_URL` (Railway auto-provides Postgres)
- `REDIS_URL` (Railway auto-provides Redis)
- `CLOUDINARY_*` credentials
- `STRIPE_*` credentials
- `TELEGRAM_BOT_TOKEN`

### Frontend (Vercel)

```bash
cd apps/web
vercel
```

Set environment variables:
- `NEXT_PUBLIC_API_URL`: Your Railway backend URL
- `NEXT_PUBLIC_SITE_URL`: Your Vercel domain

---

## ✅ Testing Checklist

### Backend Tests

```bash
cd backend
pytest  # To be implemented in Sprint 24
```

### Frontend Tests

```bash
cd apps/web
npm test  # To be configured
```

### Manual Testing

1. **Artisan Profile Pages**: Load at `/artisan/{slug}` with full story
2. **Product Detail Pages**: Show provenance, artisan earnings, impact
3. **Search & Filtering**: By craft type, region, price
4. **Cart Functionality**: Add/remove items, persist to localStorage
5. **Checkout Flow**: Guest checkout, payment method selection

---

## 🎨 Design Preservation

**CRITICAL**: The existing UI theme must be preserved exactly:

- Tailwind CSS configuration (`tailwind.config.ts`)
- Color palette (greens, golds, earth tones)
- Framer Motion animations
- GSAP heritage-pattern effects
- shadcn/ui components
- Typography (Lekton display, DM Sans body)

**Test**: If a component looks different after migration, it's wrong.

---

## 📈 Sprint Progress Tracker

| Sprint | Focus | Status | Deliverables |
|--------|-------|--------|--------------|
| 1-2 | Foundation | ✅ COMPLETE | Django setup, models, API structure |
| 3-4 | Core Data & API | 🟡 IN PROGRESS | Full API endpoints, admin interface |
| 5-6 | SSR Pages | ⏳ PENDING | Artisan/product pages with SEO |
| 7-8 | Bot + Whisper | ⏳ PENDING | Voice onboarding pipeline |
| 9-10 | Commerce | ⏳ PENDING | Orders, payments, gift flow |
| 11-12 | Dashboard | ⏳ PENDING | Artisan self-service UI |
| 13-24 | Advanced | ⏳ PENDING | Search, PWA, i18n, launch |

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Secret Key Rotation**: Change `DJANGO_SECRET_KEY` before production
3. **CORS**: Configure `CORS_ALLOWED_ORIGINS` for production domains
4. **HTTPS**: Enforce in production with `SECURE_SSL_REDIRECT`
5. **Rate Limiting**: Add django-ninja throttling for API endpoints

---

## 📞 Support & Resources

- **Django Docs**: https://docs.djangoproject.com/
- **Next.js Docs**: https://nextjs.org/docs
- **django-ninja**: https://django-ninja.dev/
- **Unfold Admin**: https://unfoldadmin.com/
- **Whisper AI**: https://github.com/openai/whisper

---

**Built with ❤️ for Ugandan artisans**  
*Thrive With Nature*  
empindu.lovable.app
