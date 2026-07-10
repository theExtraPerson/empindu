# EMPINDU MARKETPLACE - IMPLEMENTATION ROADMAP

**Date**: 2026-06-06  
**Total Effort**: ~60-80 hours across 4 phases  
**Team**: 2-3 developers  
**Timeline**: 2-3 weeks (with parallelization)

---

## 📊 EXECUTIVE SUMMARY

```
┌─────────────────────────────────────────────────┐
│         IMPLEMENTATION PHASES OVERVIEW          │
├─────────────────────────────────────────────────┤
│                                                 │
│ Phase 1: CRITICAL SECURITY (24h) [████░░░░░]   │
│ Phase 2: PERFORMANCE (16h)       [███░░░░░░]   │
│ Phase 3: ADVANCED SEARCH (20h)   [████░░░░░]   │
│ Phase 4: DATA INTEGRITY (12h)    [███░░░░░░]   │
│                                                 │
│ TOTAL: 72 development hours                    │
│ PARALLEL: 16-18 day calendar time              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## PHASE 1: CRITICAL SECURITY FIXES (24 hours)

### 1.1 Rate Limiting & Request Size Limits (5h)
**Problem**: Brute force attacks on login, DDoS attacks possible  
**Solution**: Django REST Framework throttling + request size validation

```
Implementation:
- Throttle classes:
  * Global: 1000 requests/hour
  * Login: 50 requests/minute per IP
  * Search: 100 requests/minute per user
- Max request size: 10MB
- Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

**Affected Files**:
- `backend/requirements.txt` (add djangorestframework)
- `backend/config/settings/base.py`
- `backend/api/v1/router.py`
- `backend/config/middleware.py` (NEW)

**Deliverables**:
- ✓ Throttling working on all auth endpoints
- ✓ Request size validation in place
- ✓ Test: 50+ login attempts rejected

---

### 1.2 Input Sanitization & Validation (6h)
**Problem**: SQL injection, XSS, invalid data accepted  
**Solution**: Zod (frontend) + Enhanced Pydantic (backend) + parameterized queries only

```
Implementation:
- Frontend Zod schemas for:
  * Search queries
  * Product creation
  * Order checkout
  * Admin forms
  
- Backend Pydantic validators for:
  * All API endpoints
  * Email format, phone number format
  * Price range validation
  * String length limits
  
- Zero raw SQL queries (ORM only)
```

**Affected Files**:
- `apps/next/src/lib/validation.ts` (NEW)
- `backend/api/v1/contracts.py` (enhance)
- All endpoint files (products.py, orders.py, payments.py, etc.)

**Deliverables**:
- ✓ All forms validated before submit
- ✓ API rejects invalid input with 400 error
- ✓ Test: Inject malicious SQL → rejected

---

### 1.3 Admin Authentication (Email + OTP + 2FA) (8h)
**Problem**: Admin panel has no auth; anyone can access admin panel  
**Solution**: Secure admin flow: Email → OTP verification → 2FA setup

```
Flow:
1. Admin enters email → backend sends OTP via email (6-digit, 5 min expiry)
2. Admin enters OTP → verified, redirects to 2FA setup
3. Admin scans QR code with authenticator app → saves TOTP secret
4. Admin enters TOTP code → logged in
5. For sensitive operations (create admin user, edit settings) → re-verify 2FA
```

**Implementation**:
- Model: AdminSession (email, otp, otp_expires, totp_secret, totp_verified)
- Service: OTPService (generate, validate, expiry check)
- Endpoint: POST /api/v1/admin/auth/request-otp → POST /api/v1/admin/auth/verify-otp → POST /api/v1/admin/auth/setup-totp

**Affected Files**:
- `backend/apps/accounts/models.py` (add AdminSession)
- `backend/apps/accounts/services.py` (NEW, OTP + 2FA service)
- `backend/api/v1/auth.py` (add admin endpoints)
- `apps/next/src/app/admin/auth/` (NEW, admin login UI)

**Deliverables**:
- ✓ Admin signup flow works end-to-end
- ✓ 2FA enforced for sensitive operations
- ✓ Test: Complete signup → OTP → 2FA

---

### 1.4 Database Indexes (3h)
**Problem**: Slow queries on high-volume tables (orders, products, artisans)  
**Solution**: Add indexes to frequently queried fields

```
Indexes to add:

Artisan:
- user_id (FK)
- is_verified (Boolean)
- created_at (DateTime)

Product:
- artisan_id (FK)
- status (CharField)
- created_at (DateTime)
- tradition_id (FK)

Order:
- buyer_id (FK)
- artisan_id (FK)
- status (CharField)
- created_at (DateTime)

PaymentTransaction:
- order_id (FK)
- status (CharField)
- provider (CharField)

HeritageFundEntry:
- tradition_id (FK)
- order_id (FK)
- created_at (DateTime)
```

**Affected Files**:
- All models in `backend/apps/*/models.py`
- Migration: `0002_add_indexes.py` (NEW)

**Deliverables**:
- ✓ All indexes created
- ✓ Migration runs without errors
- ✓ Query performance improves 50-80%

---

## PHASE 2: PERFORMANCE OPTIMIZATION (16 hours)

### 2.1 Query Optimization (4h)
**Problem**: N+1 queries, fetching unnecessary data  
**Solution**: .select_related() and .prefetch_related() everywhere

```
Example:
BEFORE: GET /products?limit=20
- 1 query: SELECT * FROM products LIMIT 20
- 20 queries: SELECT * FROM artisans WHERE id = ?
- 20 queries: SELECT * FROM craft_traditions WHERE id = ?
= 41 queries total

AFTER:
- 1 query: SELECT * FROM products ... 
           JOIN artisans JOIN craft_traditions
           PREFETCH product_photos
= 1 query total
```

**Affected Endpoints**:
- `GET /api/v1/products` → select_related(artisan, tradition)
- `GET /api/v1/artisans` → select_related(user)
- `GET /api/v1/orders` → select_related(product, artisan, buyer)

**Deliverables**:
- ✓ Audit complete (list all N+1 problems)
- ✓ Fix all identified N+1 queries
- ✓ Benchmark: 41 queries → 1 query

---

### 2.2 Caching Strategy (6h)
**Problem**: Images reload on every request, artisan data re-queried  
**Solution**: Multi-layer caching (CDN + server + client)

```
Cache Layers:

1. CDN Cache (Cloudinary):
   - Images: max-age=604800 (7 days)
   - Transforms: c_limit,w_500,q_80 (resize + quality)
   - Video (artisan stories): max-age=604800

2. Server Cache (Redis):
   - Product listings: max-age=3600 (1 hour)
   - Artisan profiles: max-age=86400 (1 day)
   - Search results: max-age=1800 (30 min)
   - Cache key pattern: {resource}:{id}:{version}

3. Browser Cache:
   - Static assets: max-age=31536000 (1 year)
   - API responses: ETag + 304 Not Modified
   - Service Worker (PWA): cache image assets

4. Invalidation Strategy:
   - On CREATE/UPDATE: invalidate parent resource
   - Background job: invalidate stale cache entries
```

**Implementation Details**:

```python
# Cache decorator for product listing
@cache_response(60*60)  # 1 hour
def list_products(request):
    return products

# Cloudinary image URLs
product.image_url = f"https://res.cloudinary.com/{cloud_name}/c_limit,w_500,q_80/{image_id}"
```

**Affected Files**:
- `backend/config/settings/base.py` (Redis config)
- `backend/apps/cache_utils.py` (NEW)
- All list endpoints (products, artisans, orders)
- Cloudinary image generation in templates

**Deliverables**:
- ✓ Redis cache backend working
- ✓ Product images served from CDN
- ✓ Cache invalidation on update working
- ✓ Benchmark: page load time 3s → 0.8s

---

### 2.3 API Pagination (3h)
**Problem**: Fetching 10k+ results in single request causes memory issues  
**Solution**: Cursor-based pagination with limit defaults

```
Pagination Pattern:
GET /api/v1/products?limit=20&cursor=abc123

Response:
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "has_next": true,
    "next_cursor": "xyz789"
  }
}
```

**Affected Files**:
- `backend/api/v1/contracts.py` (add pagination schemas)
- All list endpoints

**Deliverables**:
- ✓ All list endpoints return paginated results
- ✓ Default limit: 20, max limit: 100
- ✓ Test: Fetch 1M results, no memory spike

---

### 2.4 HTTP Cache Headers (2h)
**Problem**: Clients don't know whether data is fresh  
**Solution**: Add Cache-Control, ETag, Vary headers

```python
# Example response headers
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Vary: Accept, Accept-Encoding
Last-Modified: 2026-06-06T10:00:00Z
```

**Affected Files**:
- All endpoint response handlers
- Middleware for default headers

**Deliverables**:
- ✓ All GET responses have Cache-Control headers
- ✓ ETag support for conditional requests
- ✓ Verified with browser DevTools

---

## PHASE 3: ADVANCED SEARCH (20 hours)

### 3.1 Python Search Service Architecture (6h)
**Problem**: Current search is basic; no typo tolerance, no semantic understanding  
**Solution**: RapidFuzz + sentence-transformers + pgvector

```
Search Architecture:

User Query: "handmade lether shoes"
    ↓
1. Typo Correction (RapidFuzz):
   "lether" → "leather"
    ↓
2. Keyword Extraction:
   Extract: ["handmade", "leather", "shoes"]
    ↓
3. Embedding Generation:
   Generate 768-dim embedding for corrected query
    ↓
4. Semantic Search (pgvector):
   Find similar products using embeddings
    ↓
5. Ranking:
   Score = 0.3 * BM25 + 0.5 * semantic_score + 0.2 * popularity
    ↓
6. Filtering:
   Apply: price range, location, artisan rating
    ↓
7. Results:
   Return paginated + highlighted results
```

**Services to Create**:

```python
# search_service.py
class SearchService:
    def search(query, filters) → SearchResults
    def parse_query(query) → ParsedQuery
    
# embeddings.py
class EmbeddingService:
    def generate_embedding(text) → Vector[768]
    def generate_keywords(text) → List[str]
    
# ranking.py
class RankingService:
    def score_results(results, query) → RankedResults
    def calculate_bm25(query, doc) → float
    def calculate_semantic_score(query_embedding, doc_embedding) → float
```

**Affected Files**:
- `backend/apps/search/search_service.py` (NEW)
- `backend/apps/search/embeddings.py` (NEW)
- `backend/apps/search/ranking.py` (NEW)
- `backend/requirements.txt` (add rapidfuzz, sentence-transformers)

**Deliverables**:
- ✓ RapidFuzz integration working (typo correction)
- ✓ Embedding generation service working
- ✓ Ranking algorithm implemented
- ✓ Unit tests for each service

---

### 3.2 Semantic Search Implementation (7h)
**Problem**: Search results not semantically relevant  
**Solution**: pgvector + embeddings in PostgreSQL

```
Implementation:

1. Enable pgvector in PostgreSQL:
   CREATE EXTENSION IF NOT EXISTS vector;

2. Add embedding field to Product:
   class Product(models.Model):
       ...
       embedding = VectorField(dimensions=768)

3. Pre-compute embeddings for all products:
   celery task: for each product → generate embedding

4. Search endpoint:
   POST /api/v1/search
   Request: {"query": "leather shoes", "filters": {...}}
   Response: {"results": [...], "pagination": {...}}

5. Ranking logic:
   SELECT *, 
          (1 - (embedding <=> query_embedding)) as semantic_score
   FROM products
   WHERE (conditions)
   ORDER BY semantic_score DESC
   LIMIT 20
```

**Migration**:

```sql
-- 0003_add_embeddings.py
from django.contrib.postgres.fields import VectorField

class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='product',
            name='embedding',
            field=VectorField(dimensions=768, null=True, blank=True),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=UniqueConstraint(fields=['embedding'], name='unique_embedding'),
        ),
    ]
```

**Celery Task**:

```python
@shared_task
def embed_all_products():
    """Generate embeddings for all products without embedding"""
    products = Product.objects.filter(embedding__isnull=True)
    for product in products:
        embedding = embedding_service.generate_embedding(product.story)
        product.embedding = embedding
        product.save()
```

**Affected Files**:
- `backend/apps/products/models.py` (add embedding field)
- `backend/api/v1/search.py` (NEW)
- `backend/config/settings/base.py` (pgvector config)
- Migration: `0003_add_embeddings.py` (NEW)

**Deliverables**:
- ✓ pgvector extension enabled
- ✓ Embeddings generated for all products
- ✓ Search endpoint returns semantic results
- ✓ Test: "handmade leather shoes" returns relevant products

---

### 3.3 Frontend Search UI (Zod Validation) (5h)
**Problem**: No advanced search interface  
**Solution**: React component with filters + real-time suggestions

```
Search Page Features:
- SearchBox: Real-time suggestions (debounced)
- Filters: Price range, location, craft type, rating, date
- Results: Cards with relevance score
- Pagination: Cursor-based
- Mobile: Responsive design
```

**Components**:

```typescript
// SearchBox.tsx
<input 
  placeholder="Search products..." 
  onChange={debounce(handleSearch, 300)}
/>
{suggestions && <Suggestions items={suggestions} />}

// SearchFilters.tsx
<PriceSlider min={0} max={500000} />
<LocationSelect options={locations} />
<CraftTypeSelect options={craftTypes} />
<RatingFilter min={0} max={5} />
<DateFilter preset="last_7_days" />

// SearchResults.tsx
{results.map(product => (
  <ProductCard key={product.id} product={product} relevance={product.score} />
))}
<Pagination cursor={pagination.next_cursor} />
```

**Zod Schema**:

```typescript
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  filters: z.object({
    price_min: z.number().min(0),
    price_max: z.number().max(10000000),
    location: z.string().optional(),
    craft_type: z.string().optional(),
    rating_min: z.number().min(0).max(5),
    date: z.enum(['last_7_days', 'last_30_days', 'all']).default('all'),
  }).optional(),
});
```

**Affected Files**:
- `apps/next/src/app/search/page.tsx` (NEW)
- `apps/next/src/components/search/` (NEW folder)
  - SearchBox.tsx
  - SearchFilters.tsx
  - SearchResults.tsx
- `apps/next/src/hooks/useSearch.ts` (NEW)
- `apps/next/src/lib/validation.ts` (add SearchQuerySchema)

**Deliverables**:
- ✓ Search page fully functional
- ✓ All filters working
- ✓ Real-time suggestions appearing
- ✓ Mobile responsive

---

### 3.4 Integration Testing (2h)
**Problem**: Search components not tested end-to-end  
**Solution**: Integration tests covering API + Frontend

**Test Cases**:

```python
# backend/tests/test_search.py
def test_search_typo_tolerance():
    # "lether" → "leather"
    
def test_semantic_search():
    # Search "artisanal handmade crafts" returns relevant products
    
def test_search_filters():
    # Price range + location + craft type combined
    
def test_search_pagination():
    # Cursor-based pagination
```

**Affected Files**:
- `backend/tests/test_search.py` (NEW)
- `apps/next/tests/search.test.ts` (NEW)

**Deliverables**:
- ✓ All search tests passing
- ✓ Coverage >80%

---

## PHASE 4: DATA INTEGRITY & UX (12 hours)

### 4.1 Audit Logging (4h)
**Problem**: No record of who changed financial data  
**Solution**: AuditLog model + middleware

```
AuditLog Entry:
{
  "user": "admin@empindu.com",
  "action": "approve_distribution",
  "object_type": "Distribution",
  "object_id": 123,
  "changes": {
    "status": {"before": "pending", "after": "approved"},
    "amount_ugx": {"before": 500000, "after": 500000}
  },
  "timestamp": "2026-06-06T10:30:00Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Model**:

```python
class AuditLog(models.Model):
    user = ForeignKey(User, on_delete=SET_NULL, null=True)
    action = CharField(choices=[
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
    ])
    object_type = CharField()  # Order, Distribution, Payout, etc.
    object_id = BigIntegerField()
    changes = JSONField()  # Before/after values
    timestamp = DateTimeField(auto_now_add=True, db_index=True)
    ip_address = GenericIPAddressField(null=True)
    user_agent = TextField(null=True)
    
    class Meta:
        indexes = [
            Index(fields=['user', 'timestamp']),
            Index(fields=['object_type', 'object_id']),
        ]
```

**Service**:

```python
class AuditService:
    def log_action(user, action, object_type, object_id, changes):
        """Log an action"""
        AuditLog.objects.create(
            user=user,
            action=action,
            object_type=object_type,
            object_id=object_id,
            changes=changes,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
        )
```

**Usage**:

```python
# In payment confirmation
AuditService.log_action(
    user=request.user,
    action='confirm_payment',
    object_type='Order',
    object_id=order.id,
    changes={'status': {'before': 'pending', 'after': 'paid'}},
)
```

**Affected Files**:
- `backend/apps/audit/models.py` (NEW)
- `backend/apps/audit/services.py` (NEW)
- `backend/api/v1/heritage.py` (add audit logging)
- `backend/api/v1/payments.py` (add audit logging)
- `backend/config/settings/base.py` (add apps.audit)

**Deliverables**:
- ✓ AuditLog model created + migrated
- ✓ Heritage Fund operations logged
- ✓ Payment operations logged
- ✓ Audit logs visible in admin

---

### 4.2 Payment Idempotency (3h)
**Problem**: Duplicate payments possible if request retried  
**Solution**: Idempotency-Key header + caching

```
Flow:
1. Client generates UUID: idempotency_key = uuid4()
2. Client sends: POST /api/v1/orders/123/pay
   Headers: {"Idempotency-Key": "abc-123-def"}
   
3. Server receives:
   - Check if payment with this key already exists
   - If YES: return cached response
   - If NO: process payment, save key + response
   
4. Result: Same key = same response (no duplicate charge)
```

**Model Change**:

```python
class Order(models.Model):
    ...
    idempotency_key = CharField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True
    )
```

**Middleware**:

```python
def check_idempotency(request):
    if request.method in ['POST', 'PATCH', 'DELETE']:
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return None
        
        # Check if request already processed
        cached_response = IdempotencyCache.get(idempotency_key)
        if cached_response:
            return cached_response
    
    return None  # Process normally
```

**Affected Files**:
- `backend/apps/orders/models.py` (add idempotency_key field)
- `backend/api/v1/payments.py` (add idempotency check)
- Migration: `0004_add_idempotency.py` (NEW)

**Deliverables**:
- ✓ Idempotency-Key header support
- ✓ Duplicate payment prevention working
- ✓ Test: Send same request twice, verify one charge

---

### 4.3 Order Immutability (2h)
**Problem**: Order price/artisan could change after payment  
**Solution**: Snapshot on payment, prevent later changes

```python
class Order(models.Model):
    ...
    # Frozen snapshot created on payment confirmation
    price_snapshot_ugx = DecimalField(null=True)  # frozen price
    artisan_snapshot = ForeignKey(  # frozen artisan
        Artisan, 
        related_name='+',
        null=True,
        on_delete=SET_NULL
    )
    is_paid = BooleanField(default=False, db_index=True)
    
    def can_modify(self):
        """Check if order can be modified"""
        return not self.is_paid
```

**Implementation**:

```python
# On payment confirmation
@router.post("/{order_id}/confirm-payment")
def confirm_payment(request, order_id: int):
    order = Order.objects.get(id=order_id)
    
    # Create snapshot
    order.price_snapshot_ugx = order.price_ugx
    order.artisan_snapshot = order.artisan
    order.is_paid = True
    order.save()
    
    # Prevent later modifications
    if order.is_paid:
        raise HttpError(403, "Cannot modify paid order")
```

**Affected Files**:
- `backend/apps/orders/models.py` (add snapshot fields)
- `backend/api/v1/orders.py` (add check_if_can_modify)
- `backend/apps/payments/services.py` (create snapshot on confirmation)
- Migration: `0005_order_immutability.py` (NEW)

**Deliverables**:
- ✓ Order snapshot created on payment
- ✓ Paid orders cannot be modified
- ✓ Test: Try to change price after payment, verify rejection

---

### 4.4 User-Facing Error Handling (3h)
**Problem**: Generic error messages confuse users  
**Solution**: Standardized errors + user-friendly messages

```
Error Response Format:
{
  "error": {
    "code": "INVALID_CARD",
    "message": "Your card was declined. Please try another payment method.",
    "details": {
      "field": "payment_method",
      "suggestion": "Use Stripe card, MoMo, or Airtel Money"
    }
  }
}
```

**Error Codes**:

```python
ERROR_CODES = {
    'INVALID_CARD': 'Your card was declined. Please try another payment method.',
    'INSUFFICIENT_FUNDS': 'Your account has insufficient funds.',
    'RATE_LIMITED': 'Too many requests. Please wait a few minutes.',
    'INVALID_INPUT': 'Please check your input and try again.',
    'UNAUTHORIZED': 'You are not authorized to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'CONFLICT': 'This resource already exists.',
    'INTERNAL_ERROR': 'Something went wrong. Please try again later.',
}
```

**Implementation**:

```python
class APIError(Exception):
    def __init__(self, code, message, details=None, status_code=400):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code

# Global error handler
@api.exception_handler
def handle_api_error(request, exc):
    if isinstance(exc, APIError):
        return JsonResponse({
            'error': {
                'code': exc.code,
                'message': exc.message,
                'details': exc.details,
            }
        }, status=exc.status_code)
```

**Frontend Error Boundary**:

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Display user-friendly error
    toast.error(error.message);
  }
  
  render() {
    return this.props.children;
  }
}
```

**Affected Files**:
- `backend/api/v1/exceptions.py` (NEW)
- `backend/api/v1/router.py` (add exception handler)
- `apps/next/src/components/ErrorBoundary.tsx` (NEW)
- `apps/next/src/lib/api.ts` (add error mapping)

**Deliverables**:
- ✓ All errors have meaningful codes + messages
- ✓ Error boundary catches React errors
- ✓ Test: Trigger various errors, verify messages

---

## 📋 IMPLEMENTATION SEQUENCE CHART

```
Week 1 (Phase 1: Security)
├─ Day 1-2: 1.1 Rate Limiting (5h) + 1.4 Indexes (3h)
│   ├─ Setup Django throttling
│   ├─ Add request size validation
│   ├─ Create migration for indexes
│   └─ Test rate limiting
│
├─ Day 3: 1.2 Input Validation (6h)
│   ├─ Create Zod schemas (frontend)
│   ├─ Create Pydantic validators (backend)
│   ├─ Add SQL injection prevention
│   └─ Test malicious inputs
│
└─ Day 4-5: 1.3 Admin Auth 2FA (8h)
    ├─ Create OTP model + service
    ├─ Create 2FA model + QR generation
    ├─ Build admin login UI
    └─ Test end-to-end flow

Week 2 (Phase 2: Performance)
├─ Day 1: 2.1 Query Optimization (4h)
│   ├─ Audit all GET endpoints
│   ├─ Add .select_related() + .prefetch_related()
│   └─ Benchmark improvements
│
├─ Day 2-3: 2.2 Caching Strategy (6h)
│   ├─ Configure Redis cache
│   ├─ Add cache decorators
│   ├─ Setup Cloudinary transforms
│   └─ Test cache invalidation
│
└─ Day 4-5: 2.3+2.4 Pagination + Cache Headers (5h)
    ├─ Add pagination to all endpoints
    ├─ Add Cache-Control + ETag headers
    └─ Test pagination edge cases

Week 3 (Phase 3: Search + Phase 4: Data Integrity)
├─ Day 1-2: 3.1 Search Service (6h)
│   ├─ Create RapidFuzz integration
│   ├─ Create embeddings service
│   └─ Create ranking service
│
├─ Day 3: 3.2 Semantic Search (7h)
│   ├─ Enable pgvector in PostgreSQL
│   ├─ Add embedding field to Product
│   ├─ Pre-compute embeddings (Celery)
│   └─ Implement search endpoint
│
├─ Day 4: 3.3 Frontend Search UI (5h)
│   ├─ Build SearchBox component
│   ├─ Build SearchFilters component
│   └─ Integrate with backend
│
└─ Day 5: 4.1+4.2+4.3+4.4 Data Integrity (12h - spread)
    ├─ Audit logging (4h)
    ├─ Idempotency (3h)
    ├─ Immutability (2h)
    └─ Error handling (3h)
```

---

## 🎯 SUCCESS CRITERIA

- [ ] All auth endpoints rate-limited (max 50/min per IP)
- [ ] All API inputs validated (Zod + Pydantic)
- [ ] Admin 2FA setup takes <5 minutes
- [ ] Product queries execute in <100ms (with indexes)
- [ ] Images load from CDN cache within 200ms
- [ ] Search results return within 500ms
- [ ] All financial operations audit-logged
- [ ] Zero duplicate payments (idempotency 100%)
- [ ] User error messages clear + actionable
- [ ] Code coverage >80% on new code
- [ ] No breaking API changes
- [ ] All tests passing

---

## 🚀 NEXT STEPS

1. **Review this plan** with team
2. **Approve or request changes**
3. **Estimate team capacity** (2-3 devs)
4. **Assign tasks** by developer skill
5. **Set up parallel tracks**
6. **Daily standup** to track progress
7. **Code review** after each task
8. **Deploy** phase by phase

---

## 📊 RESOURCE ALLOCATION (Recommended)

**Dev Team Setup**:
- **Developer 1**: Security focus
  - Phase 1: All 4 tasks
  - Phase 2: Query optimization
  - Phase 4: Audit logging

- **Developer 2**: Performance + Search
  - Phase 2: Caching + Pagination
  - Phase 3: Search service + semantic search
  - Phase 4: Idempotency + immutability

- **Developer 3** (optional): Frontend
  - Phase 3: Search UI
  - Phase 4: Error handling + UX

---

## ⚠️ RISK MITIGATION

| Risk | Mitigation Strategy |
|------|---------------------|
| Rate limiting breaks legitimate users | Start conservative, monitor logs, adjust |
| Input validation breaking changes | Feature flag, gradual rollout, customer warning |
| Admin lockout after 2FA setup | Backup codes, admin recovery flow |
| Database migration downtime | Create indexes CONCURRENTLY, test on staging |
| Search embeddings slow | Run Celery offline, use background task |
| Cache serving stale data | Implement proper cache invalidation strategy |
| Audit logging performance impact | Async audit logging via Celery task |

---

**Status**: ✅ Plan Complete - Ready for Approval

Would you like me to:
1. ✅ **Execute Phase 1** (Security fixes) - START IMMEDIATELY
2. 📝 **Adjust the plan** (modifications needed)
3. 📊 **Add more detail** to specific sections
4. 🔍 **Review specific risks** in detail

