# Empindu Implementation Summary

## What Has Been Set Up

### 1. MySQL Database Configuration ✅
- Updated `requirements.txt` with `mysqlclient==2.2.6` for MySQL support
- Updated `.env.example` with MySQL connection string examples
- Database URL format: `mysql://user:password@host:port/database`

### 2. Row Level Security (RLS) for Orders ✅
Enhanced `/backend/api/v1/orders.py` with RLS implementation:

**Access Control:**
- **Admins**: Can view and update all orders
- **Artisans**: Can only view and update their own orders
- **Buyers**: Can only view their own orders
- **Unauthenticated**: No access

**Updated Endpoints:**
- `GET /orders` - Lists orders filtered by user role (RLS enforced)
- `GET /orders/{id}` - Gets order with permission check
- `PATCH /orders/{id}/status` - Updates order status (artisan/admin only)

### 3. API Client Enhancement ✅
Updated `/apps/next/src/lib/api.ts`:
- Added JWT token authentication support
- Added `getAuthToken()` function to retrieve tokens from localStorage
- Enhanced `apiFetch()` to automatically include Authorization header
- Added new endpoints:
  - `getOrder(orderId)` - Fetch single order
  - `updateOrderStatus(orderId, status)` - Update order status

### 4. Frontend Artisan Dashboard ✅
Created new components:

**Hook: `useArtisanOrders.ts`**
- Fetches artisan's orders with RLS
- Provides order status update mutation
- Handles caching with React Query

**Component: `ArtisanOrdersDashboard.tsx`**
- Displays orders in a table with status badges
- Shows earnings per order
- Allows artisans to update order status
- Displays summary statistics (total orders, earnings, pending)

### 5. Sample Data Management Command ✅
Created `/backend/apps/products/management/commands/load_sample_data.py`

**Includes:**
- 3 Craft Traditions (Kiganda Basket Weaving, Acholi Pottery, Ankole Leather)
- 3 Artisans (Grace Nakamatte, James Okello, Aida Mugisa)
- 9 Sample Products across all traditions
- Realistic pricing in both UGX and USD

**Usage:**
```bash
cd backend
python manage.py load_sample_data
# or with --clear flag to reset data first
python manage.py load_sample_data --clear
```

### 6. Setup Automation Scripts ✅
Created platform-specific setup scripts:

**Windows: `setup.ps1`**
```powershell
.\setup.ps1
```

**macOS/Linux: `setup.sh`**
```bash
bash setup.sh
```

These scripts automatically:
- Check prerequisites (Python, Node.js, MySQL)
- Create Python virtual environment
- Install all dependencies
- Run migrations
- Create superuser (interactive)
- Optional: Load sample data
- Set up frontend environment

## Quick Start Guide

### 1. Install MySQL
```bash
# macOS
brew install mysql
brew services start mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database
```bash
mysql -u root -p
CREATE DATABASE empindu_db;
CREATE USER 'empindu'@'localhost' IDENTIFIED BY 'empindu_password';
GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Run Setup Script
**Windows:**
```powershell
.\setup.ps1 -LoadSampleData
```

**macOS/Linux:**
```bash
bash setup.sh
```

### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Frontend
cd apps/next
npm run dev
```

### 5. Access the Application
- **Admin Panel:** http://localhost:8000/admin
  - Login with superuser credentials
  - Manage products, artisans, orders
- **API Documentation:** http://localhost:8000/api/v1/docs
  - Swagger UI with interactive testing
- **Frontend:** http://localhost:3000
  - Browse products
  - View orders (with RLS)

## Testing RLS (Row Level Security)

### 1. Get JWT Token
```bash
# Login endpoint (from auth API)
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "artisan_test", "password": "password123"}'
```

### 2. Test Artisan Access
```bash
# Artisan sees only their own orders
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/v1/orders

# Returns only orders for authenticated artisan
```

### 3. Test Admin Access
```bash
# Admin sees all orders
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:8000/api/v1/orders
```

### 4. Test Permission Denied
```bash
# Non-owner cannot see order
curl -H "Authorization: Bearer DIFFERENT_ARTISAN_TOKEN" \
  http://localhost:8000/api/v1/orders/1

# Returns 403 Forbidden
```

## Sample Data Overview

### Artisans
1. **Grace Nakamatte** (Kampala)
   - Craft: Kiganda Basket Weaving
   - Experience: 15 years
   - Products: 3 baskets

2. **James Okello** (Gulu)
   - Craft: Acholi Pottery
   - Experience: 20 years
   - Products: 3 pottery items

3. **Aida Mugisa** (Mbarara)
   - Craft: Ankole Hide Leather
   - Experience: 12 years
   - Products: 3 leather items

### Product Pricing
- Small items: UGX 120,000-180,000 ($30-45)
- Medium items: UGX 200,000-280,000 ($50-70)
- Large items: UGX 250,000-350,000 ($65-90)

## Files Created/Modified

### Created Files
- `/backend/apps/products/management/commands/load_sample_data.py` - Sample data command
- `/apps/next/src/hooks/useArtisanOrders.ts` - React hook for artisan orders
- `/apps/next/src/components/admin/ArtisanOrdersDashboard.tsx` - Artisan dashboard component
- `/BACKEND_FRONTEND_SETUP.md` - Detailed setup guide
- `/setup.ps1` - Windows setup script
- `/setup.sh` - Unix setup script

### Modified Files
- `/backend/requirements.txt` - Added mysqlclient
- `/backend/.env.example` - Updated with MySQL examples
- `/backend/api/v1/orders.py` - Added RLS implementation
- `/apps/next/src/lib/api.ts` - Added JWT auth & endpoints

## Next Steps

### Immediate
1. ✅ Set up MySQL database
2. ✅ Run setup script
3. ✅ Load sample data
4. ✅ Test artisan dashboard

### Short-term
- [ ] Implement payment processing (Stripe/MoMo)
- [ ] Add image upload for products
- [ ] Implement email notifications
- [ ] Set up Celery tasks for async operations

### Medium-term
- [ ] Deploy to production (Railway, Vercel)
- [ ] Set up automated backups
- [ ] Implement advanced search/filtering
- [ ] Add customer reviews
- [ ] Implement refund management

### Long-term
- [ ] ML-based recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Blockchain-based authentication

## Troubleshooting

### MySQL Connection Issues
```bash
# Test connection
mysql -u empindu -p empindu_db -e "SELECT 1;"

# Check Django settings
python manage.py dbshell
```

### API Not Responding
1. Verify Django server running: `python manage.py runserver`
2. Check API_BASE URL in frontend: `process.env.NEXT_PUBLIC_API_URL`
3. Check CORS settings in backend

### RLS Permission Denied
- Ensure JWT token is valid
- Check user has associated artisan profile
- Admin users always have access

### Sample Data Not Loading
```bash
# Verify command exists
python manage.py help load_sample_data

# Load with verbose output
python manage.py load_sample_data -v 2
```

## Additional Resources

- Django Ninja Docs: https://django-ninja.rest-framework.com/
- Next.js Docs: https://nextjs.org/docs
- React Query Docs: https://tanstack.com/query/latest
- MySQL Docs: https://dev.mysql.com/doc/

## Support

For issues or questions:
1. Check Django error logs: `tail -f backend/logs/django.log`
2. Check browser console for frontend errors
3. Review API documentation: http://localhost:8000/api/v1/docs
4. Check database directly: `mysql -u empindu -p empindu_db`
