# Empindu Backend & Frontend Integration Guide

## 1. Database Setup (MySQL)

### Prerequisites
- MySQL 8.0+ installed
- Python 3.10+
- Node.js 18+

### Step 1: Create MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE empindu_db;
CREATE USER 'empindu'@'localhost' IDENTIFIED BY 'empindu_password';
GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Backend
```bash
cd backend

# Install MySQL Python driver
pip install mysqlclient==2.2.6

# Update .env file
cp .env.example .env

# Edit .env and set:
DATABASE_URL=mysql://empindu:empindu_password@localhost:3306/empindu_db
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### Step 3: Run Migrations
```bash
python manage.py migrate
```

## 2. Create Superuser (Admin)
```bash
python manage.py createsuperuser
# Follow prompts for username, email, password
```

## 3. Add Sample Data

### Option A: Using Django Shell
```bash
python manage.py shell
```

Then in the shell:
```python
from apps.artisans.models import CraftTradition, Artisan
from apps.products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

# Create a craft tradition
tradition = CraftTradition.objects.create(
    name="Kiganda Basket Weaving",
    ethnic_group="Baganda",
    region="Central Uganda",
    description="Traditional weaving technique using natural sisal fibers",
    gi_status="pending"
)

# Create a test user for artisan
user = User.objects.create_user(
    username="artisan_test",
    email="artisan@empindu.com",
    password="testpass123",
    first_name="John",
    last_name="Weaver"
)

# Create artisan
artisan = Artisan.objects.create(
    user=user,
    slug="john-weaver",
    craft_tradition=tradition,
    bio="I've been weaving baskets for 10 years using traditional methods",
    community="Kampala",
    district="Kampala",
    phone="+256700000000",
    onboarded_via="web",
    years_experience=10,
    is_active=True
)

# Create sample products
for i in range(3):
    Product.objects.create(
        artisan=artisan,
        craft_tradition=tradition,
        slug=f"kiganda-basket-{i+1}",
        name=f"Handwoven Kiganda Basket #{i+1}",
        story=f"This basket is hand-crafted using traditional Kiganda techniques. Each basket tells a story of cultural heritage and sustainable craftsmanship.",
        material="Natural sisal fiber from family land",
        technique="Kiganda coiling - 3-strand plait",
        days_to_make=3,
        price_ugx=150000,
        price_usd=40,
        stock=5,
        status="active"
    )

print("✓ Sample data created successfully!")
exit()
```

### Option B: Using Admin Panel
1. Navigate to http://localhost:8000/admin
2. Login with superuser credentials
3. Create CraftTradition
4. Create User and Artisan
5. Create Products

## 4. Frontend Configuration

### Step 1: Set Environment Variables
```bash
cd apps/next

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 5. Backend API Running

### Start Django Development Server
```bash
cd backend
python manage.py runserver
# API will be available at http://localhost:8000/api/v1
```

### API Documentation
- OpenAPI/Swagger: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## 6. Row Level Security (RLS) - Orders

The backend implements RLS for orders:

### Access Rules:
- **Admins**: See and update all orders
- **Artisans**: See only their own orders, can update status
- **Buyers**: See only their own orders (read-only)
- **Unauthenticated users**: Cannot view orders

### Artisan Dashboard Example:
```typescript
// Frontend code to fetch artisan's orders
import { getOrders } from '@/lib/api';

async function loadArtisanOrders() {
  const orders = await getOrders();
  // Returns only orders for the authenticated artisan
  return orders;
}
```

### API Endpoints with RLS:
- `GET /orders` - List orders (filtered by user role)
- `GET /orders/{id}` - Get order details (with permission check)
- `PATCH /orders/{id}/status` - Update order status (artisan/admin only)

## 7. Testing the Integration

### Test Product Listing
```bash
curl http://localhost:8000/api/v1/products
```

### Test Artisan Orders (with Auth)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/v1/orders
```

### Create Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 1,
    "payment_method": "stripe",
    "shipping_name": "John Doe",
    "buyer_email": "buyer@example.com",
    "buyer_phone": "+256700000000",
    "shipping_country": "UG",
    "shipping_address": {
      "line1": "123 Main St",
      "city": "Kampala",
      "postcode": "00100"
    }
  }'
```

## 8. Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u empindu -p empindu_db -e "SELECT 1;"

# Check Django database config
python manage.py dbshell
```

### API Not Responding
1. Ensure Django server is running: `python manage.py runserver`
2. Check API_BASE URL in frontend: `process.env.NEXT_PUBLIC_API_URL`
3. Verify CORS is enabled in backend settings

### CORS Issues
The backend has CORS enabled. Update `CORS_ALLOWED_ORIGINS` in `backend/config/settings/base.py` if needed:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
```

## 9. Production Deployment

### Database
- Use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
- Update DATABASE_URL in environment

### Frontend (Vercel)
```bash
cd apps/next
vercel deploy
```

### Backend (Railway, Heroku, etc.)
```bash
cd backend
# Push to deployment platform
```

### Environment Variables
Set these in your deployment platform:
- `DATABASE_URL` - Production MySQL connection string
- `SECRET_KEY` - Strong random key
- `DEBUG` - Set to False
- `ALLOWED_HOSTS` - Your domain
- `REDIS_URL` - Production Redis URL
- `FRONTEND_URL` - Your frontend domain
- `STRIPE_SECRET_KEY` - Production Stripe key

## 10. Next Steps

- [ ] Set up email notifications for orders
- [ ] Implement Stripe payment processing
- [ ] Add file upload for artisan photos
- [ ] Set up celery tasks for async operations
- [ ] Configure production Redis cache
- [ ] Set up Sentry error tracking
- [ ] Implement user authentication UI
- [ ] Add artisan dashboard
- [ ] Set up automated backups
