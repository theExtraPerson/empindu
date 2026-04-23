# Empindu Complete Setup & Testing Walkthrough

## Part 1: Initial Setup (15 minutes)

### Step 1.1: Create MySQL Database
```bash
# Connect to MySQL
mysql -u root -p

# In MySQL shell:
CREATE DATABASE empindu_db;
CREATE USER 'empindu'@'localhost' IDENTIFIED BY 'empindu_password';
GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 1.2: Configure Backend
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and set (or keep defaults):
# DATABASE_URL=mysql://empindu:empindu_password@localhost:3306/empindu_db
# DEBUG=True
# SECRET_KEY=your-secret-key-change-in-production
```

### Step 1.3: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 1.4: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 1.5: Run Migrations
```bash
python manage.py migrate
# Output: Running migrations... (18 migrations)
# ✓ Success
```

### Step 1.6: Create Superuser
```bash
python manage.py createsuperuser
# Follow prompts:
# Username: admin
# Email: admin@empindu.com
# Password: (enter password)
```

## Part 2: Load Sample Data (3 minutes)

```bash
# In backend directory with venv activated
python manage.py load_sample_data

# Output should show:
# Creating craft traditions...
#   ✓ Kiganda Basket Weaving (created)
#   ✓ Acholi Pottery (created)
#   ✓ Ankole Cattle Hide Craft (created)
# 
# Creating artisans...
#   ✓ Grace Nakamatte - Kiganda Basket Weaving (created)
#   ✓ James Okello - Acholi Pottery (created)
#   ✓ Aida Mugisa - Ankole Cattle Hide Craft (created)
#
# Creating products...
#   ✓ Large Round Kiganda Storage Basket (created)
#   ✓ Small Decorative Kiganda Basket (created)
#   ✓ (... 6 more products)
#
# ✅ Sample data loaded successfully!
```

## Part 3: Start Backend (5 minutes)

### Step 3.1: Start Django Server
```bash
# Make sure you're in backend directory with venv activated
python manage.py runserver
# Output:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C
```

### Step 3.2: Verify Backend is Working
Open in browser: http://localhost:8000/api/v1/docs
- Should see Swagger UI
- All endpoints listed

## Part 4: Setup Frontend (5 minutes)

### Step 4.1: Create .env.local
```bash
cd apps/next

# Create .env.local file with:
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

### Step 4.2: Install Dependencies
```bash
npm install
# (This may take a couple of minutes)
```

### Step 4.3: Start Frontend Development Server
```bash
npm run dev
# Output:
# ▲ Next.js 15.x.x
# - Local:        http://localhost:3000
# - Environments: .env.local
```

## Part 5: Testing (10 minutes)

### Step 5.1: View Products
1. Open http://localhost:3000
2. Navigate to products section
3. Should see all 9 sample products
4. Click on a product to view details

### Step 5.2: Admin Panel
1. Go to http://localhost:8000/admin
2. Login with superuser credentials (admin/password)
3. Browse:
   - Craft Traditions (3 items)
   - Artisans (3 items)
   - Products (9 items)
   - Orders (empty initially)

### Step 5.3: API Documentation
1. Go to http://localhost:8000/api/v1/docs
2. Click on "Try it out" for GET /products
3. Execute the request
4. Should return all 9 products

## Part 6: Test Row Level Security (RLS)

### Step 6.1: Get JWT Token for Artisan
```bash
# Get token for artisan1
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "grace_weaver",
    "password": "password123"
  }'

# Response (save the "access" token):
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }
```

### Step 6.2: Test Artisan Can View Own Orders
```bash
# Set token variable
TOKEN="your_access_token_here"

# List artisan's orders
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/orders

# Should return: [] (empty, because no orders yet)
```

### Step 6.3: Create a Test Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 1,
    "payment_method": "stripe",
    "shipping_name": "Test Buyer",
    "buyer_email": "buyer@test.com",
    "buyer_phone": "+256700000000",
    "shipping_country": "UG",
    "shipping_address": {
      "line1": "123 Main St",
      "city": "Kampala",
      "postcode": "00100"
    }
  }'

# Response will include new order ID
```

### Step 6.4: Verify Artisan Can See Own Orders
```bash
# Get artisan1's orders (should now show the order we just created)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/orders

# Response:
# [
#   {
#     "id": 1,
#     "product_name": "Large Round Kiganda Storage Basket",
#     "artisan_name": "Grace Nakamatte",
#     "status": "pending_payment",
#     ...
#   }
# ]
```

### Step 6.5: Get Token for Different Artisan
```bash
# Get token for different artisan
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "james_potter",
    "password": "password123"
  }'

# Save this token as TOKEN2
```

### Step 6.6: Verify Second Artisan Cannot See First's Orders
```bash
TOKEN2="james_potter_token"

# Try to see orders from different artisan's perspective
curl -H "Authorization: Bearer $TOKEN2" \
  http://localhost:8000/api/v1/orders

# Should return: [] (empty - no orders for james_potter)
```

### Step 6.7: Admin Can See All Orders
```bash
# Get admin token
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_admin_password"
  }'

ADMIN_TOKEN="admin_token_here"

# Admin sees all orders
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/v1/orders

# Response shows all orders regardless of artisan
```

### Step 6.8: Test Permission Denied
```bash
TOKEN2="james_potter_token"

# Try to access order belonging to grace_weaver
curl -H "Authorization: Bearer $TOKEN2" \
  http://localhost:8000/api/v1/orders/1

# Response:
# {
#   "detail": "You don't have permission to view this order"
# }
```

## Part 7: Artisan Dashboard

### Step 7.1: Create Buyer Account (Optional)
```bash
# In Django shell or admin panel, create test buyer
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
User = get_user_model()

buyer = User.objects.create_user(
    username='testbuyer',
    email='buyer@test.com',
    password='password123'
)
print("Buyer created!")
exit()
```

### Step 7.2: Artisan Dashboard Component
The ArtisanOrdersDashboard component in the frontend:
- Automatically fetches artisan's orders via RLS
- Shows earnings per order
- Allows status updates
- Displays statistics

To use in your app:
```tsx
import { ArtisanOrdersDashboard } from '@/components/admin/ArtisanOrdersDashboard';

export default function ArtisanPage() {
  return <ArtisanOrdersDashboard />;
}
```

## Part 8: Verify Everything Works

### Checklist
- [ ] MySQL database created and running
- [ ] Django migrations applied
- [ ] Sample data loaded (3 artisans, 9 products)
- [ ] Backend server running on :8000
- [ ] Frontend server running on :3000
- [ ] Products visible in frontend
- [ ] Admin panel accessible
- [ ] API docs working
- [ ] JWT tokens generating
- [ ] Artisan can see own orders
- [ ] Artisan cannot see others' orders
- [ ] Admin can see all orders

## Part 9: Production Deployment Checklist

### Before Going Live
- [ ] Set DEBUG=False in production
- [ ] Change SECRET_KEY to secure value
- [ ] Update ALLOWED_HOSTS
- [ ] Use HTTPS only
- [ ] Set up production database
- [ ] Configure Redis cache
- [ ] Set up Celery for async tasks
- [ ] Configure email backend
- [ ] Set up monitoring/logging
- [ ] Regular backups enabled

## Troubleshooting

### "ModuleNotFoundError: No module named 'mysqlclient'"
```bash
pip install mysqlclient
```

### "Can't connect to MySQL server"
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify .env DATABASE_URL is correct
```

### "CORS error in frontend"
Update CORS settings in `backend/config/settings/base.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
```

### "API returns 401 Unauthorized"
- Ensure JWT token is included in Authorization header
- Token format: `Authorization: Bearer TOKEN`
- Check token hasn't expired

### "Order returns 403 Forbidden"
- User doesn't have permission to view/edit order
- Check if user is the artisan or buyer of the order
- Admins should be able to access any order

## Next Steps

### After Successful Setup
1. Implement payment processing (Stripe/MoMo)
2. Add file uploads for product photos
3. Set up email notifications
4. Implement review system
5. Add search/filtering
6. Deploy to production

### Further Reading
- [Django Ninja Documentation](https://django-ninja.rest-framework.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support Resources

### Local Development
- Django Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/v1/docs
- Frontend: http://localhost:3000

### Debugging
- Django logs: Check terminal running `runserver`
- Frontend console: F12 in browser
- Database: `mysql -u empindu -p empindu_db`

### Getting Help
1. Check error messages in terminal
2. Look at API response details
3. Review browser console (F12)
4. Check Django error logs
5. Test with curl before integrating in frontend
