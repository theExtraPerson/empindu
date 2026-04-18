# Frontend-Backend Integration Status Report

**Date**: March 21, 2026  
**Status**: ⚠️ Migration In Progress  
**Tagline**: Thrive With Nature 🌿

---

## 📊 Current Architecture Analysis

### ✅ What's Working

#### Backend (Django) - **READY**
- ✅ Django 5.0.6 + django-ninja REST API
- ✅ SQLite database with migrations
- ✅ Unfold admin interface
- ✅ Core models: Artisan, Product, CraftTradition, Order, Heritage
- ✅ API endpoints: `/api/v1/artisans/`, `/api/v1/products/`
- ✅ Story-first product architecture
- ✅ Provenance tracking
- ✅ Revenue split transparency (85/3/12)

#### Frontend (React/Vite) - **NEEDS MIGRATION**
- ✅ Existing UI components preserved
- ✅ Tailwind CSS theme matching backend brand
- ✅ Framer Motion animations
- ✅ shadcn/ui components
- ⚠️ Currently configured for Supabase (needs Django API)
- ⚠️ Located in `apps/web/src/` (Vite app, not Next.js yet)

---

## 🔗 New Integration Layer Created

### Files Added Today

1. **`apps/web/.env`**
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   VITE_SITE_URL=http://127.0.0.1:5173
   ```

2. **`apps/web/src/lib/api.ts`**
   - Typed API client matching Django schemas
   - Functions: `getArtisans()`, `getProduct()`, `getCraftTraditions()`
   - Full TypeScript type definitions
   - Error handling

### Data Type Mapping

| Django Model | TypeScript Interface | Status |
|--------------|---------------------|--------|
| Artisan | `Artisan`, `ArtisanBrief` | ✅ Mapped |
| Product | `Product`, `ProductList` | ✅ Mapped |
| CraftTradition | `CraftTradition` | ✅ Mapped |
| ProvenanceRecord | Embedded in Product | ✅ Mapped |

---

## ⚠️ Compatibility Issues to Address

### 1. **Data Schema Differences**

**Supabase → Django Field Changes:**

| Old Field (Supabase) | New Field (Django) | Notes |
|---------------------|-------------------|-------|
| `id` (UUID string) | `id` (integer) | Django auto-increment |
| `artisan_id` (string) | `artisan.id` (nested) | Relational structure |
| `price` (decimal) | `price_ugx`, `price_usd` | Dual currency |
| `description` | `story` | Story-first architecture |
| `category` | `craft_tradition` | Cultural IP anchor |
| `stock_quantity` | `stock` | Simplified naming |
| `is_available` | `status` (enum) | draft/active/sold_out/archived |
| N/A | `artisan_earnings_ugx` | NEW: Revenue transparency |
| N/A | `heritage_fund_ugx` | NEW: Heritage Fund |
| N/A | `provenance` | NEW: Immutable record |

### 2. **Component Updates Needed**

**High Priority Components:**

1. **`src/hooks/useProducts.tsx`**
   - Replace Supabase queries with `lib/api.ts` calls
   - Update Product interface to match Django schema
   - Add story, provenance, revenue split fields

2. **`src/hooks/useAuth.tsx`**
   - Replace Supabase auth with Django JWT (future)
   - For now: keep existing auth or disable for testing

3. **`src/pages/ProductDetail.tsx`**
   - Update to use `story` instead of `description`
   - Add provenance display component
   - Show artisan earnings breakdown

4. **`src/pages/Artisans.tsx`**
   - Filter by `craft_tradition` instead of `category`
   - Display certification status
   - Show order count and earnings

### 3. **Missing Features (Phase 2)**

These exist in strategy but not yet implemented:

- [ ] Orders API endpoints (Sprint 9-10)
- [ ] Gift commerce flow (Sprint 9-10)
- [ ] Payment integration (Sprint 9-10)
- [ ] Cart checkout (Sprint 9-10)
- [ ] User reviews (Sprint 11-12)
- [ ] Telegram bot onboarding (Sprint 7-8)
- [ ] Whisper voice transcription (Sprint 7-8)

---

## 🚀 Immediate Next Steps

### Option A: Quick Test (Recommended First)

Test the API integration without full migration:

```bash
# Terminal 1: Start Django backend
cd d:\iks\empindu\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2: Start Vite frontend
cd d:\iks\empindu\apps\web
npm install
npm run dev
```

Then create a simple test page:

```tsx
// apps/web/src/TestApi.tsx
import { getArtisans, getProducts } from '@/lib/api';

export function TestApi() {
  const [artisans, setArtisans] = useState([]);
  
  useEffect(() => {
    getArtisans().then(setArtisans);
  }, []);
  
  return (
    <div>
      <h1>API Test</h1>
      <pre>{JSON.stringify(artisans, null, 2)}</pre>
    </div>
  );
}
```

### Option B: Full Component Migration (Sprint 3-4)

Systematically update each hook and page:

1. **Week 1**: Update all hooks (`useProducts`, `useAuth`, etc.)
2. **Week 2**: Update all pages (ProductDetail, Artisans, etc.)
3. **Week 3**: Add new features (provenance display, story sections)
4. **Week 4**: Testing and polish

---

## 📝 Recommended Migration Strategy

### Phase 1: Compatibility Layer (NOW)
- ✅ Create `lib/api.ts` wrapper (DONE)
- ✅ Configure environment variables (DONE)
- ⏳ Update interfaces/types to match Django
- ⏳ Keep existing UI components unchanged

### Phase 2: Hook Migration (Week 1-2)
Update hooks one at a time:
1. `useProducts` → Use `lib/api.getProducts()`
2. `useArtisans` → Use `lib/api.getArtisans()`
3. `useAuth` → Keep existing or stub out
4. `useCart` → Keep existing (localStorage-based)

### Phase 3: Page Updates (Week 2-3)
Update pages to handle new data structure:
- ProductDetail: Add story, provenance, revenue split
- Artisans: Show certification, craft tradition
- Marketplace: Filter by craft tradition

### Phase 4: Next.js Migration (Sprint 5-6)
Convert Vite app to Next.js 14 App Router:
- Better SEO with SSR
- Server Components for product pages
- Improved performance

---

## 🎯 Success Criteria

### Backend Ready ✅
- [x] Models defined
- [x] Migrations applied
- [x] Admin interface working
- [x] API endpoints responding
- [x] Sample data added

### Frontend Integration ⏳
- [ ] Environment configured
- [ ] API client created
- [ ] Types aligned
- [ ] Hooks updated
- [ ] Pages displaying data
- [ ] No console errors

### Full Platform 📋
- [ ] Browse artisans
- [ ] View products with stories
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Order tracking
- [ ] Artisan dashboard

---

## 💡 Key Architectural Decisions

### Why Not Next.js Yet?

**Current**: Vite React SPA in `apps/web/src/`

**Reasoning**:
1. Existing components work fine as SPA
2. Faster to migrate incrementally
3. Can add Next.js later without rewriting components
4. Focus on backend connectivity first

**When to Migrate to Next.js**:
- After basic functionality works
- When SEO becomes critical
- For SSR product pages
- Sprint 5-6 timeline

### Why Django Ninja over DRF?

1. **Async-native** - Critical for Whisper/Celery
2. **Automatic OpenAPI docs** - `/api/v1/docs`
3. **Pydantic types** - Better validation
4. **TypeScript generation** - Future codegen potential

---

## 🔧 Developer Tools

### Test API Connectivity

```bash
# From apps/web directory
curl http://127.0.0.1:8000/api/v1/artisans/
curl http://127.0.0.1:8000/api/v1/products/
curl http://127.0.0.1:8000/api/v1/docs
```

### Check CORS Configuration

If you see CORS errors in browser console:

```python
# backend/config/settings/base.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Next.js future
]
```

---

## 📊 Timeline Estimate

| Phase | Effort | Deliverables |
|-------|--------|--------------|
| API Integration | 1-2 days | lib/api.ts, types aligned |
| Hook Migration | 3-5 days | All hooks using Django API |
| Page Updates | 5-7 days | All pages displaying data |
| Testing | 2-3 days | Bug fixes, edge cases |
| Next.js Migration | 7-10 days | SSR, SEO, PWA |

**Total to MVP**: ~3 weeks  
**To Full Launch**: ~8-10 weeks (with advanced features)

---

## ✅ Recommendation

**Start with Option A** (Quick Test):
1. Run both servers (Django + Vite)
2. Create simple test component
3. Verify API connectivity
4. Then proceed with systematic migration

This gives you immediate feedback and confidence before the full migration effort.

---

**Built with ❤️ for Ugandan artisans**  
*Thrive With Nature*  
empindu.lovable.app
