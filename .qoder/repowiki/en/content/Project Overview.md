# Project Overview

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [PROGRESS_REPORT.md](file://PROGRESS_REPORT.md)
- [backend/config/settings/base.py](file://backend/config/settings/base.py)
- [backend/requirements.txt](file://backend/requirements.txt)
- [package.json](file://package.json)
- [backend/api/v1/router.py](file://backend/api/v1/router.py)
- [backend/apps/artisans/models.py](file://backend/apps/artisans/models.py)
- [backend/apps/products/models.py](file://backend/apps/products/models.py)
- [backend/apps/orders/models.py](file://backend/apps/orders/models.py)
- [src/pages/Index.tsx](file://src/pages/Index.tsx)
- [src/components/sections/ImpactDashboard.tsx](file://src/components/sections/ImpactDashboard.tsx)
- [src/hooks/usePlatformStats.tsx](file://src/hooks/usePlatformStats.tsx)
- [src/components/layout/Header.tsx](file://src/components/layout/Header.tsx)
- [src/components/business/BusinessRegistration.tsx](file://src/components/business/BusinessRegistration.tsx)
- [src/components/gifting/GiftThisModal.tsx](file://src/components/gifting/GiftThisModal.tsx)
- [backend/apps/telegram_bot/__init__.py](file://backend/apps/telegram_bot/__init__.py)
- [backend/apps/ml/__init__.py](file://backend/apps/ml/__init__.py)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
Empindu is a production-grade artisan marketplace connecting traditional Ugandan craftspeople with conscious global consumers. Its mission is to preserve cultural heritage by anchoring each product to a craft tradition and artisan story, while enabling sustainable, transparent commerce with fair revenue distribution. The platform integrates a Django backend with a Next.js frontend, a Telegram bot layer, and AI/ML capabilities for voice transcription and semantic search.

Key value propositions:
- For buyers: Story-first product pages, direct artisan relationships, gift commerce, multilingual support, and international shipping.
- For artisans: Zero-cost onboarding via WhatsApp/Telegram, voice note biography transcription, professional digital presence, real-time earnings, and automated mobile money payouts.
- For platform operations: Branded admin panel, heritage fund tracking, impact analytics, and automated notifications.

## Project Structure
The repository follows a monorepo architecture with:
- Backend: Django 5 + django-ninja API, Unfold admin, PostgreSQL with pgvector, Redis, Celery, Meilisearch, and Telegram bot integration.
- Frontend: Next.js 14 App Router (SSR, PWA), shadcn/ui primitives, Radix UI, and Recharts for analytics.
- Infrastructure: Docker Compose for local services, Railway for backend, Vercel for frontend.
- Supabase functions and migrations support payment and notification workflows.

```mermaid
graph TB
subgraph "Frontend (Next.js)"
IDX["Index Page<br/>Hero + Sections"]
HDR["Header Navigation"]
IDASH["Impact Dashboard"]
end
subgraph "Backend (Django)"
API["django-ninja API v1"]
ART["Artisans App Models"]
PRD["Products App Models"]
ORD["Orders App Models"]
UNF["Unfold Admin Panel"]
end
subgraph "Infrastructure"
DB["PostgreSQL + pgvector"]
REDIS["Redis"]
MEILI["Meilisearch"]
BOT["Telegram Bot App"]
ML["ML/AI App"]
end
IDX --> API
HDR --> API
IDASH --> API
API --> ART
API --> PRD
API --> ORD
UNF --> ART
UNF --> PRD
UNF --> ORD
API --> DB
API --> REDIS
API --> MEILI
API --> BOT
API --> ML
```

**Diagram sources**
- [backend/config/settings/base.py:29-64](file://backend/config/settings/base.py#L29-L64)
- [backend/api/v1/router.py:30-40](file://backend/api/v1/router.py#L30-L40)
- [backend/apps/artisans/models.py:14-170](file://backend/apps/artisans/models.py#L14-L170)
- [backend/apps/products/models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [backend/apps/orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [src/pages/Index.tsx:11-27](file://src/pages/Index.tsx#L11-L27)
- [src/components/sections/ImpactDashboard.tsx:48-367](file://src/components/sections/ImpactDashboard.tsx#L48-L367)

**Section sources**
- [README.md:3-49](file://README.md#L3-L49)
- [PROGRESS_REPORT.md:15-87](file://PROGRESS_REPORT.md#L15-L87)

## Core Components
- Django backend with Unfold admin and django-ninja API.
- Data models for artisans, products, orders, gifting, heritage, and ML/AI.
- Next.js frontend with SSR pages, analytics dashboard, and user-centric flows.
- Telegram bot app and ML app placeholders for future implementation.
- Supabase functions for payment and notification orchestration.

**Section sources**
- [backend/config/settings/base.py:29-64](file://backend/config/settings/base.py#L29-L64)
- [backend/requirements.txt:1-49](file://backend/requirements.txt#L1-L49)
- [package.json:14-67](file://package.json#L14-L67)
- [backend/apps/artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [backend/apps/products/models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [backend/apps/orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [src/components/sections/ImpactDashboard.tsx:48-367](file://src/components/sections/ImpactDashboard.tsx#L48-L367)

## Architecture Overview
Empindu’s architecture blends a modern full-stack approach with cultural IP anchoring:
- Backend: Django 5 with Unfold admin, ASGI for WebSockets, JWT-authenticated django-ninja endpoints, PostgreSQL + pgvector, Redis, Meilisearch, Celery, and Telegram bot.
- Frontend: Next.js 14 App Router with SSR/PWA, shadcn/ui components, and analytics dashboards powered by Supabase queries.
- Bot layer: Telegram bot app prepared for webhook handlers and AI transcription workflows.
- ML/AI: Whisper and embeddings integrated for voice transcription and semantic search.

```mermaid
graph TB
FE["Next.js Frontend"]
BE["Django Backend"]
DB["PostgreSQL"]
VEC["pgvector"]
R["Redis"]
MS["Meilisearch"]
TG["Telegram Bot"]
WH["Whisper/Embeddings"]
FE --> |REST/SSR| BE
BE --> DB
DB --> VEC
BE --> R
BE --> MS
BE --> TG
BE --> WH
```

**Diagram sources**
- [README.md:5-15](file://README.md#L5-L15)
- [backend/config/settings/base.py:100-121](file://backend/config/settings/base.py#L100-L121)
- [backend/requirements.txt:21-24](file://backend/requirements.txt#L21-L24)
- [backend/apps/telegram_bot/__init__.py:1-2](file://backend/apps/telegram_bot/__init__.py#L1-L2)
- [backend/apps/ml/__init__.py:1-2](file://backend/apps/ml/__init__.py#L1-L2)

**Section sources**
- [README.md:5-15](file://README.md#L5-L15)
- [PROGRESS_REPORT.md:93-116](file://PROGRESS_REPORT.md#L93-L116)

## Detailed Component Analysis

### Data Model Layer
The data models implement a story-first, heritage-anchored architecture:
- Artisan model captures identity, craft tradition, certifications, multilingual biographies, and voice draft fields for AI transcription.
- Product model emphasizes storytelling, revenue split, provenance records, and embedding vectors for semantic search.
- Order model tracks lifecycle, frozen financial snapshots, gift orders, and payout statuses.

```mermaid
erDiagram
USER {
uuid id PK
string email UK
string username
}
CRAFT_TRADITION {
uuid id PK
string name
string name_luganda
string ethnic_group
string region
text description
string gi_status
decimal heritage_fund_levy_pct
}
CERTIFICATION {
uuid id PK
string name
text description
text requirements
boolean is_active
}
ARTISAN {
uuid id PK
uuid user_id FK
string slug UK
uuid craft_tradition_id FK
text bio
text bio_luganda
text bio_swahili
text bio_draft
string bio_draft_language
timestamp bio_draft_at
string community
string district
string phone
string momo_number
string telegram_chat_id
boolean is_certified
string onboarded_via
boolean is_active
int years_experience
}
PRODUCT {
uuid id PK
uuid artisan_id FK
uuid craft_tradition_id FK
string slug UK
string name
string name_luganda
text story
text story_luganda
text story_swahili
text story_draft
string story_draft_language
timestamp story_draft_at
string material
string technique
int days_to_make
decimal price_ugx
decimal price_usd
decimal artisan_pct
decimal heritage_pct
decimal platform_pct
int stock
string status
boolean is_customisable
int weight_grams
}
PROVENANCE_RECORD {
uuid id PK
uuid product_id FK
string artisan_name
string community
string district
string craft_tradition
string ethnic_group
text technique_detail
string material_source
string gi_status
string record_hash
timestamp created_at
}
ORDER {
uuid id PK
uuid product_id FK
uuid buyer_id FK
uuid artisan_id FK
string status
string payout_status
boolean is_gift
uuid gift_details_id FK
int quantity
decimal price_ugx
decimal price_usd
decimal artisan_earnings_ugx
decimal platform_commission_ugx
decimal heritage_fund_ugx
string payment_method
string payment_reference
string shipping_name
json shipping_address
string shipping_country
string tracking_number
}
USER ||--o{ ARTISAN : "has"
CRAFT_TRADITION ||--o{ ARTISAN : "anchors"
ARTISAN ||--o{ PRODUCT : "lists"
CRAFT_TRADITION ||--o{ PRODUCT : "influences"
PRODUCT ||--|| PROVENANCE_RECORD : "has"
PRODUCT ||--o{ ORDER : "ordered_by"
USER ||--o{ ORDER : "placed"
ARTISAN ||--o{ ORDER : "fulfills"
```

**Diagram sources**
- [backend/apps/artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [backend/apps/products/models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [backend/apps/orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)

**Section sources**
- [backend/apps/artisans/models.py:14-170](file://backend/apps/artisans/models.py#L14-L170)
- [backend/apps/products/models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [backend/apps/orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)

### API Layer and Authentication
The API uses django-ninja with JWT authentication and CORS support. It exposes routes for artisans, products, orders, and gifting, with typed schemas and OpenAPI documentation.

```mermaid
sequenceDiagram
participant Client as "Next.js Frontend"
participant API as "django-ninja API v1"
participant Auth as "JWT Bearer"
participant Art as "Artisans App"
participant Prod as "Products App"
participant Ord as "Orders App"
Client->>API : GET /api/v1/artisans/
API->>Auth : Validate JWT
Auth-->>API : User
API->>Art : Fetch artisans with filters
Art-->>API : Serialized artisans
API-->>Client : 200 OK JSON
Client->>API : GET /api/v1/products/{slug}
API->>Prod : Retrieve product + provenance
Prod-->>API : Product + embedding
API-->>Client : 200 OK JSON
```

**Diagram sources**
- [backend/api/v1/router.py:10-40](file://backend/api/v1/router.py#L10-L40)
- [backend/config/settings/base.py:160-167](file://backend/config/settings/base.py#L160-L167)

**Section sources**
- [backend/api/v1/router.py:22-40](file://backend/api/v1/router.py#L22-L40)
- [backend/config/settings/base.py:172-176](file://backend/config/settings/base.py#L172-L176)

### Frontend Experience and Impact Dashboard
The frontend delivers a story-driven marketplace with SSR pages, navigation, and an impact dashboard that visualizes platform metrics using Supabase data and Recharts.

```mermaid
flowchart TD
Start(["User visits homepage"]) --> Hero["HeroSection renders"]
Hero --> Features["FeaturedArtisans + CraftCategories"]
Features --> Recommendations["YouMightAlsoLike"]
Recommendations --> Impact["ImpactDashboard toggles"]
Impact --> Stats["usePlatformStats fetches metrics"]
Stats --> Charts["Bar/Pie charts render"]
Charts --> End(["User engaged with impact"])
```

**Diagram sources**
- [src/pages/Index.tsx:11-27](file://src/pages/Index.tsx#L11-L27)
- [src/components/sections/ImpactDashboard.tsx:48-367](file://src/components/sections/ImpactDashboard.tsx#L48-L367)
- [src/hooks/usePlatformStats.tsx:17-94](file://src/hooks/usePlatformStats.tsx#L17-L94)

**Section sources**
- [src/pages/Index.tsx:11-27](file://src/pages/Index.tsx#L11-L27)
- [src/components/sections/ImpactDashboard.tsx:48-367](file://src/components/sections/ImpactDashboard.tsx#L48-L367)
- [src/hooks/usePlatformStats.tsx:17-94](file://src/hooks/usePlatformStats.tsx#L17-L94)

### User Roles and Navigation
The header adapts to user roles (buyer, artisan, admin) and provides contextual navigation and actions.

```mermaid
flowchart TD
Load["Header loads"] --> Role{"User logged in?"}
Role --> |No| Guest["Show SIGN IN"]
Role --> |Yes| Profile["Show user menu"]
Profile --> Nav["Navigation items"]
Nav --> Dashboard{"Role == artisan/admin?"}
Dashboard --> |Yes| Products["Products/Dashboard links"]
Dashboard --> |No| Guest
Nav --> Admin{"Role == admin?"}
Admin --> |Yes| AdminPanel["Admin link"]
Admin --> |No| Guest
```

**Diagram sources**
- [src/components/layout/Header.tsx:26-275](file://src/components/layout/Header.tsx#L26-L275)

**Section sources**
- [src/components/layout/Header.tsx:26-275](file://src/components/layout/Header.tsx#L26-L275)

### Gift Commerce Flow
The gift modal enables corporate/gifting purchases with sender/recipient details and personalized messages.

```mermaid
sequenceDiagram
participant User as "Buyer"
participant Modal as "GiftThisModal"
participant Auth as "Auth Hook"
participant Gifting as "useCorporateGifting"
participant Toast as "Toast"
User->>Modal : Click "GIFT THIS PRODUCT"
Modal->>Auth : Check user session
Auth-->>Modal : User present
Modal->>Gifting : submitGiftOrder(payload)
Gifting-->>Modal : success/failure
Modal->>Toast : Show result
Modal-->>User : Close modal and reset form
```

**Diagram sources**
- [src/components/gifting/GiftThisModal.tsx:23-208](file://src/components/gifting/GiftThisModal.tsx#L23-L208)

**Section sources**
- [src/components/gifting/GiftThisModal.tsx:23-208](file://src/components/gifting/GiftThisModal.tsx#L23-L208)

### Business Registration for Artisans
Artisans can register business profiles for gift commerce and operational needs.

**Section sources**
- [src/components/business/BusinessRegistration.tsx:30-205](file://src/components/business/BusinessRegistration.tsx#L30-L205)

## Dependency Analysis
Technology stack summary:
- Backend: Django 5, django-ninja, Unfold admin, PostgreSQL + pgvector, Redis, Celery, Meilisearch, python-telegram-bot, OpenAI Whisper, Cloudinary, Stripe, django-cors-headers, django-environ, Sentry.
- Frontend: Next.js 14, shadcn/ui, Radix UI, Recharts, Framer Motion, Zustand, TanStack Query, Supabase JS.

```mermaid
graph LR
DJ["Django Backend"]
NX["Next.js Frontend"]
DB["PostgreSQL"]
VEC["pgvector"]
R["Redis"]
MS["Meilisearch"]
TG["Telegram Bot"]
WH["Whisper"]
CL["Cloudinary"]
ST["Stripe"]
CO["CORS Headers"]
EN["django-environ"]
SE["Sentry"]
NX --> DJ
DJ --> DB
DB --> VEC
DJ --> R
DJ --> MS
DJ --> TG
DJ --> WH
DJ --> CL
DJ --> ST
DJ --> CO
DJ --> EN
DJ --> SE
```

**Diagram sources**
- [backend/requirements.txt:1-49](file://backend/requirements.txt#L1-L49)
- [package.json:14-67](file://package.json#L14-L67)

**Section sources**
- [backend/requirements.txt:1-49](file://backend/requirements.txt#L1-L49)
- [package.json:14-67](file://package.json#L14-L67)

## Performance Considerations
- Use pgvector for semantic search to reduce latency and simplify deployment.
- Leverage Redis for caching and Celery for asynchronous tasks.
- Employ SSR and ISR patterns in Next.js to optimize initial load and freshness.
- Monitor API performance and enable rate limiting and Sentry error tracking in production.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common setup and runtime issues:
- Environment variables: Ensure .env files are created in both backend and frontend directories with required keys for database, Redis, Cloudinary, Stripe, Telegram, and OpenAI.
- CORS: Verify allowed origins match frontend URLs.
- Database migrations: Run migrations after starting infrastructure services.
- Telegram webhook: Secure webhook endpoint with secret token and configure site URL.
- Redis connectivity: Confirm Redis URL is reachable by Django and Celery.

**Section sources**
- [README.md:109-152](file://README.md#L109-L152)
- [backend/config/settings/base.py:160-167](file://backend/config/settings/base.py#L160-L167)
- [backend/config/settings/base.py:108-121](file://backend/config/settings/base.py#L108-L121)

## Conclusion
Empindu is building a culturally grounded, technically robust artisan marketplace. Its architecture balances scalability and heritage preservation, integrating AI/ML, multilingual support, and a seamless buyer-artisan experience. The roadmap outlines clear milestones for frontend migration, bot and payment integrations, and advanced features, positioning Empindu for sustainable growth and impact.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Technology Stack Summary
- Backend: Django 5, django-ninja, Unfold, PostgreSQL + pgvector, Redis, Celery, Meilisearch, python-telegram-bot, OpenAI Whisper, Cloudinary, Stripe, Sentry.
- Frontend: Next.js 14, shadcn/ui, Radix UI, Recharts, Framer Motion, TanStack Query, Supabase JS.

**Section sources**
- [README.md:5-15](file://README.md#L5-L15)
- [backend/requirements.txt:1-49](file://backend/requirements.txt#L1-L49)
- [package.json:14-67](file://package.json#L14-L67)

### Deployment Strategy
- Backend: Railway with Procfile and railway.toml.
- Frontend: Vercel deployment.
- Infrastructure: Docker Compose for local services.

**Section sources**
- [README.md:179-203](file://README.md#L179-L203)
- [PROGRESS_REPORT.md:273-290](file://PROGRESS_REPORT.md#L273-L290)

### Business Impact Metrics
- Artisan metrics: Onboarded artisans, average earnings increase, voice onboarding completion, profile view to first listing conversion.
- Buyer metrics: Homepage to product page conversion, product page to cart conversion, cart to checkout completion, diaspora vs local split, gift flow usage.
- Platform metrics: Total transactions, heritage fund contributions, average order value, repeat purchase rate, NPS.

**Section sources**
- [PROGRESS_REPORT.md:395-416](file://PROGRESS_REPORT.md#L395-L416)