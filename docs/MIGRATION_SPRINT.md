# 🚀 Frontend Migration Sprint - Story-First Architecture

**Date**: March 21, 2026  
**Sprint**: 3-4 (Full Component Migration)  
**Status**: IN PROGRESS  

---

## ✅ Phase 1: API Integration Layer (COMPLETE)

### Files Created:
- ✅ `apps/web/.env` - Django API URL configuration
- ✅ `apps/web/src/lib/api.ts` - Typed API client with all endpoints
- ✅ `apps/web/src/components/ApiTest.tsx` - Integration test component

### Documentation:
- ✅ `INTEGRATION_STATUS.md` - Comprehensive analysis
- ✅ `TESTING_GUIDE.md` - Step-by-step testing
- ✅ `INTEGRATION_COMPLETE.md` - Summary report

---

## ⏳ Phase 2: Hook Migration (IN PROGRESS)

### Priority Order:

#### 1. **useProducts Hook** ⏳ IN PROGRESS

**Changes Made:**
- ✅ Replaced Supabase queries with Django API calls
- ✅ Updated interface to match Django schema
- ✅ Implemented story-first fields (`story` instead of `description`)
- ✅ Added revenue transparency fields (`artisan_earnings_ugx`, `heritage_fund_ugx`)
- ✅ Added provenance tracking
- ✅ Changed ID type from UUID string to integer
- ✅ Changed slug-based lookups

**File**: `apps/web/src/hooks/useProducts.tsx`

**Old Interface (Supabase):**
```typescript
{
  id: string;           // UUID
  artisan_id: string;   // Flat structure
  description: string;
  price: number;        // Single price
  category: string;
  stock_quantity: number;
}
```

**New Interface (Django):**
```typescript
{
  id: number;              // Auto-increment integer
  slug: string;            // SEO-friendly slug
  story: string;           // Story-first narrative
  price_ugx: number;       // Dual currency
  price_usd: number;
  artisan_earnings_ugx: number; // Revenue split
  heritage_fund_ugx: number;    // Heritage contribution
  stock: number;
  status: 'active' | 'sold_out' | ...;
  artisan: ArtisanBrief;   // Nested relational data
  provenance: Provenance;  // Immutable cultural record
  photos: ProductPhoto[];
}
```

**API Functions Used:**
- `getProducts(filters)` - List products with pagination
- `getProduct(slug)` - Get single product by slug

---

#### 2. **useArtisans Hook** ⏹️ TODO

**Create New File**: `apps/web/src/hooks/useArtisans.tsx`

**Expected Interface:**
```typescript
export interface Artisan {
  id: number;
  slug: string;
  full_name: string;
  bio: string;
  community: string;
  district: string;
  craft_tradition: {
    id: number;
    name: string;
    ethnic_group: string;
    region: string;
  };
  profile_photo_url: string | null;
  is_certified: boolean;
  years_experience: number;
  order_count: number;
  total_earnings_ugx: number;
}
```

**API Functions to Use:**
- `getArtisans(filters)` - List artisans
- `getArtisan(slug)` - Get artisan by slug
- `getCraftTraditions()` - List craft traditions

---

#### 3. **useAuth Hook** ⏸️ ON HOLD

**Decision**: Keep existing Supabase auth for now or stub out until Django JWT auth implemented in Sprint 9-10.

---

#### 4. **useCart Hook** ✅ KEEP AS-IS

**Decision**: Cart remains localStorage-based, no backend integration needed yet.

---

## 📋 Phase 3: Page Updates (TODO)

### Page Migration Checklist:

#### 1. **ProductDetail Page** ⏹️ TODO
**File**: `apps/web/src/pages/ProductDetail.tsx`

**Updates Needed:**
- [ ] Change from `id` param to `slug` param
- [ ] Replace `description` with `story` section
- [ ] Add provenance display component
- [ ] Show revenue split breakdown (85/3/12)
- [ ] Update artisan link to use slug
- [ ] Display certification badge if certified
- [ ] Show "Days to Make" field
- [ ] Update image gallery to use `photos` array
- [ ] Remove old fields: `category`, `materials`, `use_case`

**Story-First Layout:**
```
1. Hero Image + Title
2. ARTISAN STORY (leads the page) ← NEW
3. Product Details (material, technique)
4. REVENUE SPLIT TRANSPARENCY ← NEW
   - Artisan Earnings: UGX XX,XXX
   - Heritage Fund: UGX X,XXX
   - Platform: 12%
5. PROVENANCE RECORD ← NEW
   - Artisan name, community, district
   - Craft tradition, ethnic group
   - GI status
6. Price & Add to Cart
```

---

#### 2. **Marketplace Page** ⏹️ TODO
**File**: `apps/web/src/pages/Marketplace.tsx`

**Updates Needed:**
- [ ] Filter by `craft_tradition` instead of `category`
- [ ] Show story excerpt on product cards
- [ ] Display artisan earnings on cards
- [ ] Add certification badges
- [ ] Update pagination for Django API

---

#### 3. **Artisans Page** ⏹️ TODO
**File**: `apps/web/src/pages/Artisans.tsx`

**Updates Needed:**
- [ ] Use new `useArtisans` hook
- [ ] Filter by `craft_tradition` not specialty
- [ ] Show certification status prominently
- [ ] Display order count and earnings
- [ ] Link to profiles by slug
- [ ] Add ethnic group information

---

#### 4. **ArtisanProfile Page** ⏹️ TODO
**File**: `apps/web/src/pages/ArtisanProfile.tsx`

**Updates Needed:**
- [ ] Load artisan by slug
- [ ] Display full bio story
- [ ] Show craft tradition detail
- [ ] List products by this artisan
- [ ] Display impact metrics:
  - Total earnings
  - Orders delivered
  - Years experience
- [ ] Add certification badge

---

## 🎨 CXO/UX Requirements Implementation

### Chief Experience Officer Requirements:

#### 1. **Emotional Connection** ✅
- ✅ Story-first product pages
- ✅ Artisan narratives lead over specs
- ✅ Bio sections with personal voice

#### 2. **Cultural Authenticity** ✅
- ✅ Provenance records immutable
- ✅ Ethnic group attribution
- ✅ Craft tradition preservation
- ✅ GI status display

#### 3. **Transparency & Trust** ✅
- ✅ Revenue split visible (85/3/12)
- ✅ Heritage Fund tracking
- ✅ Artisan earnings shown
- ✅ Certification badges

#### 4. **User Journey** ⏳
- [ ] Clear breadcrumbs
- [ ] Intuitive filtering
- [ ] Smooth image galleries
- [ ] Quick view modals
- [ ] Wishlist/favorites

---

## 🔧 Technical Implementation Details

### Data Flow Architecture:

```
Browser (React SPA)
    ↓ fetch('/api/v1/products/')
Vite Dev Server (Port 5173)
    ↓ HTTP GET /api/v1/products/
Django Ninja (Port 8000)
    ↓ ORM query
SQLite Database
    ↓ JSON response
Django Ninja
    ↓ HTTP 200 OK
Vite React App
    ↓ setState()
Component Renders
```

### Type Safety Strategy:

**Shared Types**: Define in `lib/api.ts`, import everywhere
```typescript
// lib/api.ts
export interface Product { ... }

// hooks/useProducts.tsx
import type { Product } from '@/lib/api';

// components/ProductCard.tsx
import type { Product } from '@/lib/api';
```

### Error Handling Pattern:

```typescript
try {
  const product = await getProduct(slug);
  setProduct(product);
} catch (error: unknown) {
  console.error('Error:', error);
  toast({
    title: "Error",
    description: "Failed to load product",
    variant: "destructive"
  });
}
```

---

## 📊 Migration Progress Tracker

| Component | Status | Django API | Notes |
|-----------|--------|------------|-------|
| **Hooks** | | | |
| useProducts | ⏳ In Progress | ✅ getProducts, getProduct | Updating interfaces |
| useArtisans | ⏹️ TODO | ⏹️ getArtisans | Create new hook |
| useAuth | ⏸️ On Hold | ⏹️ Future JWT | Keep Supabase for now |
| useCart | ✅ Keep | N/A | localStorage-based |
| **Pages** | | | |
| ProductDetail | ⏹️ TODO | ⏹️ getProduct(slug) | Story-first layout |
| Marketplace | ⏹️ TODO | ⏹️ getProducts() | Filter updates |
| Artisans | ⏹️ TODO | ⏹️ getArtisans() | New data structure |
| ArtisanProfile | ⏹️ TODO | ⏹️ getArtisan(slug) | Full bio display |
| **Features** | | | |
| Story Display | ⏹️ TODO | N/A | UI component |
| Provenance | ⏹️ TODO | N/A | New component |
| Revenue Split | ⏹️ TODO | N/A | Transparency UI |
| Certification | ⏹️ TODO | N/A | Badge component |

---

## 🎯 Success Criteria

### Technical KPIs:
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] API calls successful (200 OK)
- [ ] Data displays correctly
- [ ] Loading states work
- [ ] Error boundaries catch failures

### UX KPIs:
- [ ] Story sections prominent
- [ ] Provenance visible
- [ ] Revenue split clear
- [ ] Certification badges show
- [ ] Images load properly
- [ ] Navigation intuitive

### Business KPIs:
- [ ] Artisan profiles complete
- [ ] Product stories told
- [ ] Cultural context preserved
- [ ] Impact transparent

---

## 🚀 Next Steps

### Immediate (Today):
1. ✅ Fix TypeScript import path issues
2. ⏳ Complete useProducts hook migration
3. ⏳ Test with Django backend running
4. ⏳ Verify data loads correctly

### This Week:
1. Create useArtisans hook
2. Update ProductDetail page
3. Add story-first layout
4. Implement provenance display
5. Show revenue splits

### Next Week:
1. Update all remaining pages
2. Add certification badges
3. Polish loading states
4. Test edge cases
5. Performance optimization

---

## 💡 Developer Notes

### Breaking Changes to Remember:

1. **ID Type Changed**: `string` (UUID) → `number` (integer)
2. **Lookups by Slug**: Not ID anymore
3. **Nested Artisan Data**: Not flat structure
4. **Dual Currency**: Both UGX and USD required
5. **Required Fields**: `story`, `material`, `technique` now mandatory

### Migration Tips:

1. **Start Simple**: Test with one product/artisan first
2. **Use TypeScript**: Let types guide you
3. **Check Console**: Errors will show what's missing
4. **Compare APIs**: Django API docs at `/api/v1/docs`
5. **Incremental**: Migrate one component at a time

---

**Built with ❤️ for Ugandan artisans**  
*Empindu - Thrive With Nature*  
empindu.lovable.app
