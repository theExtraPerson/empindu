# 🧪 Frontend-Backend Integration Testing Guide

**Quick Start**: Test the Django backend connectivity with your React frontend

---

## 🚀 Step-by-Step Testing

### **Step 1: Start Django Backend** (Terminal 1)

```powershell
cd d:\iks\empindu\backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run migrations (if not done)
python manage.py migrate

# Start server
python manage.py runserver
```

✅ You should see: `Starting development at http://127.0.0.1:8000/`

### **Step 2: Verify Backend is Working**

Open browser and visit:
- http://127.0.0.1:8000/ → Landing page ✅
- http://127.0.0.1:8000/admin/ → Admin panel ✅
- http://127.0.0.1:8000/api/v1/docs → API documentation ✅
- http://127.0.0.1:8000/api/v1/artisans/ → Artisans API (empty list) ✅
- http://127.0.0.1:8000/api/v1/products/ → Products API (empty list) ✅

### **Step 3: Add Sample Data** (via Admin Panel)

1. Go to http://127.0.0.1:8000/admin/
2. Login with your superuser credentials
3. **Add a Craft Tradition**:
   - Click "Craft Traditions" → "Add"
   - Name: "Kiganda Basket Weaving"
   - Ethnic group: "Baganda"
   - Region: "Central Uganda"
   - Description: "Traditional basket weaving technique passed down through generations"
   - GI Status: "None"
   - Save

4. **Add an Artisan**:
   - Click "Artisans" → "Add"
   - Fill in details (use test data)
   - Select the craft tradition you just created
   - Upload a profile photo (optional)
   - Save

5. **Add a Product**:
   - Click "Products" → "Add"
   - Select the artisan
   - Add story, materials, technique
   - Set price (e.g., 50000 UGX / 15 USD)
   - Upload product photos
   - Set status to "Active"
   - Save

### **Step 4: Start Vite Frontend** (Terminal 2)

```powershell
cd d:\iks\empindu\apps\web

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

### **Step 5: Test API Integration**

#### Option A: Use the Test Component

1. Edit `apps/web/src/App.tsx`:

```tsx
import { ApiTest } from '@/components/ApiTest';

function App() {
  return <ApiTest />;
}

export default App;
```

2. Visit http://localhost:5173/
3. Click "Load Artisans" and "Load Products" buttons
4. You should see your data from Django!

#### Option B: Test in Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run these commands:

```javascript
// Test artisans fetch
fetch('http://127.0.0.1:8000/api/v1/artisans/')
  .then(r => r.json())
  .then(console.log);

// Test products fetch
fetch('http://127.0.0.1:8000/api/v1/products/')
  .then(r => r.json())
  .then(console.log);
```

---

## ✅ Success Indicators

### Backend Working ✅
- [x] Landing page loads at http://127.0.0.1:8000/
- [x] Admin panel accessible
- [x] API docs show Swagger UI
- [x] `/api/v1/artisans/` returns JSON array
- [x] `/api/v1/products/` returns JSON array

### Frontend Connected ✅
- [x] Vite dev server running
- [x] No CORS errors in console
- [x] API test component shows "Connected to Django Backend"
- [x] Can load artisans and products
- [x] Data displays correctly

---

## ⚠️ Troubleshooting

### Issue: "Failed to fetch" error

**Cause**: Backend not running or wrong URL

**Fix**:
1. Check backend is running: `http://127.0.0.1:8000/api/v1/docs`
2. Verify `.env` file exists: `apps/web/.env`
3. Check API_URL is correct: `VITE_API_URL=http://127.0.0.1:8000/api/v1`
4. Restart Vite dev server after changing .env

### Issue: CORS errors in console

**Cause**: Django not configured to accept requests from Vite

**Fix**: Add to `backend/config/settings/base.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

Then restart Django server.

### Issue: No data showing (empty arrays)

**Cause**: Database has no records yet

**Fix**: Add sample data via admin panel (see Step 3 above)

### Issue: Module not found errors

**Cause**: Dependencies not installed

**Fix**:
```bash
cd apps/web
npm install
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐      HTTP       ┌──────────────┐
│   Browser   │ ←────────────→  │  Vite (SPA)  │
│ (React App) │                 │  Port 5173   │
└─────────────┘                 └──────┬───────┘
                                       │
                            fetch('/api/v1/...')
                                       │
                                       ↓
                              ┌────────────────┐
                              │ Django Ninja   │
                              │  Port 8000     │
                              └───────┬────────┘
                                      │
                              ┌───────▼────────┐
                              │   SQLite DB    │
                              │  db.sqlite3    │
                              └────────────────┘
```

---

## 🎯 Next Steps After Testing

Once the test component works:

### 1. **Update Existing Hooks**

Replace Supabase calls in hooks with Django API:

```typescript
// BEFORE (Supabase)
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('status', 'active');

// AFTER (Django)
import { getProducts } from '@/lib/api';

const products = await getProducts();
```

### 2. **Update TypeScript Types**

Align your interfaces with Django schema:

```typescript
// Update src/hooks/useProducts.tsx
export interface Product {
  id: number;              // Was string (UUID)
  slug: string;            // NEW
  name: string;
  story: string;           // Was description
  price_ugx: number;       // Was price
  price_usd: number;       // NEW
  artisan_earnings_ugx: number; // NEW
  heritage_fund_ugx: number;    // NEW
  // ... etc
}
```

### 3. **Migrate Pages One by One**

Start with simplest page:
1. Marketplace listing → Use `getProducts()`
2. Product detail → Use `getProduct(slug)`
3. Artisans list → Use `getArtisans()`
4. Artisan profile → Use `getArtisan(slug)`

---

## 🛠️ Developer Tools

### Useful Commands

```bash
# Backend: Create migrations
python manage.py makemigrations

# Backend: Apply migrations
python manage.py migrate

# Backend: Create superuser
python manage.py createsuperuser

# Backend: Collect static files
python manage.py collectstatic --noinput

# Frontend: Build for production
npm run build

# Frontend: Preview production build
npm run preview
```

### API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/artisans/` | GET | List all artisans |
| `/api/v1/artisans/{slug}/` | GET | Get artisan by slug |
| `/api/v1/products/` | GET | List products (paginated) |
| `/api/v1/products/{slug}/` | GET | Get product detail |
| `/api/v1/artisans/traditions/list/` | GET | List craft traditions |
| `/api/v1/docs` | GET | Interactive API docs |

---

## 📝 Testing Checklist

Before moving to full migration:

- [ ] Backend server runs without errors
- [ ] Can access admin panel
- [ ] Added at least 1 craft tradition
- [ ] Added at least 1 artisan
- [ ] Added at least 1 product
- [ ] API endpoints return data
- [ ] Frontend dev server starts
- [ ] Test component loads successfully
- [ ] Can fetch artisans via button
- [ ] Can fetch products via button
- [ ] Data displays with correct formatting
- [ ] No console errors
- [ ] Images load correctly
- [ ] Revenue split shows (85/3/12)

---

## 🎉 When Everything Works

You should see:
- ✅ Artisan cards with photos, names, locations
- ✅ Product cards with stories, prices, provenance
- ✅ Revenue breakdown (artisan earnings, heritage fund)
- ✅ Certification badges
- ✅ Craft tradition information

**Congratulations!** Your Django backend is successfully serving data to your React frontend! 🌿

---

**Thrive With Nature**  
empindu.lovable.app
