# Row Level Security (RLS) Implementation Guide

## Overview
Row Level Security is implemented at the API level to ensure users can only access their own data.

## Architecture

### Permission Model
```
User Types:
├── Admin (staff=True or superuser=True)
│   └── Can view/update ALL orders
├── Artisan (has artisan profile)
│   ├── Can view their own orders
│   └── Can update their own order status
└── Buyer (regular user)
    └── Can view their own orders (read-only)
```

## API RLS Implementation

### File: `/backend/api/v1/orders.py`

#### Helper Functions
```python
def get_user_artisan(user):
    """Get artisan profile for a user"""
    return user.artisan if user and hasattr(user, 'artisan') else None

def is_admin(user):
    """Check if user is admin or staff"""
    return user and (user.is_staff or user.is_superuser)

def can_view_order(user, order: Order) -> bool:
    """Check if user can view an order"""
    # Admins see everything
    if is_admin(user):
        return True
    # Artisans see their own
    if get_user_artisan(user) and order.artisan_id == get_user_artisan(user).id:
        return True
    # Buyers see their own
    if order.buyer_id == user.id:
        return True
    return False

def can_update_order(user, order: Order) -> bool:
    """Check if user can update an order"""
    if is_admin(user):
        return True
    if get_user_artisan(user) and order.artisan_id == get_user_artisan(user).id:
        return True
    return False
```

#### Endpoints

**1. GET /orders - List Orders (RLS Enforced)**
```python
@router.get("", response=List[OrderOut])
def list_orders(request, buyer_email: Optional[str] = None):
    user = request.auth
    
    if is_admin(user):
        # Admin sees all
        queryset = Order.objects.select_related("product", "artisan__user")
    elif get_user_artisan(user):
        # Artisan sees their own
        queryset = Order.objects.filter(artisan=get_user_artisan(user))
    elif user and user.is_authenticated:
        # Buyer sees their own
        queryset = Order.objects.filter(buyer=user)
    else:
        # Unauthenticated: empty
        return []
    
    return [serialize_order(order) for order in queryset[:100]]
```

**2. GET /orders/{id} - Get Order (Permission Check)**
```python
@router.get("/{order_id}", response=OrderOut)
def get_order(request, order_id: int):
    order = get_object_or_404(Order, pk=order_id)
    
    if not can_view_order(request.auth, order):
        raise HttpError(403, "Permission denied")
    
    return serialize_order(order)
```

**3. PATCH /orders/{id}/status - Update Status (RLS + Permission)**
```python
@router.patch("/{order_id}/status", response=OrderOut)
def update_order_status(request, order_id: int, payload: OrderStatusUpdateIn):
    order = get_object_or_404(Order, pk=order_id)
    
    if not can_update_order(request.auth, order):
        raise HttpError(403, "Only artisan or admin can update")
    
    order = transition_order(order, payload.status)
    return serialize_order(order)
```

## Testing RLS

### Setup Test Users
```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.artisans.models import Artisan, CraftTradition
from apps.products.models import Product
from apps.orders.models import Order

User = get_user_model()

# Create artisan users
user1 = User.objects.create_user(
    username='artisan1',
    email='artisan1@test.com',
    password='testpass'
)

user2 = User.objects.create_user(
    username='artisan2',
    email='artisan2@test.com',
    password='testpass'
)

# Create admin
admin = User.objects.create_superuser(
    username='admin',
    email='admin@test.com',
    password='testpass'
)

# Create artisans
tradition = CraftTradition.objects.first()
artisan1 = Artisan.objects.create(
    user=user1,
    slug='artisan1',
    craft_tradition=tradition,
    phone='+256700000001',
    community='Kampala',
    district='Kampala'
)

artisan2 = Artisan.objects.create(
    user=user2,
    slug='artisan2',
    craft_tradition=tradition,
    phone='+256700000002',
    community='Gulu',
    district='Gulu'
)

# Create products
product1 = Product.objects.create(
    artisan=artisan1,
    craft_tradition=tradition,
    slug='product1',
    name='Product 1',
    story='Story 1',
    price_ugx=100000,
    price_usd=25,
    status='active'
)

# Create orders
order1 = Order.objects.create(
    artisan=artisan1,
    product=product1,
    status='paid',
    payment_method='stripe',
    buyer_email='buyer@test.com',
    buyer_phone='+256700000000',
    shipping_name='Buyer',
    shipping_country='UG',
    shipping_address={'line1': '123 St'},
    price_ugx=100000,
    price_usd=25,
    artisan_earnings_ugx=85000,
    platform_commission_ugx=15000,
    heritage_fund_ugx=0
)

print("Test data created!")
exit()
```

### Get JWT Tokens
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "artisan1",
    "password": "testpass"
  }'

# Response:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }
```

### Test Scenarios

#### Scenario 1: Artisan Viewing Own Orders
```bash
ARTISAN1_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Should return order1
curl -H "Authorization: Bearer $ARTISAN1_TOKEN" \
  http://localhost:8000/api/v1/orders

# Response:
# [
#   {
#     "id": 1,
#     "product_name": "Product 1",
#     ...
#   }
# ]
```

#### Scenario 2: Artisan Viewing Other's Orders
```bash
ARTISAN2_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Should return empty (Artisan2 has no orders)
curl -H "Authorization: Bearer $ARTISAN2_TOKEN" \
  http://localhost:8000/api/v1/orders

# Response: []
```

#### Scenario 3: Artisan Trying to View Specific Order
```bash
ARTISAN2_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Should return 403 (order belongs to artisan1)
curl -H "Authorization: Bearer $ARTISAN2_TOKEN" \
  http://localhost:8000/api/v1/orders/1

# Response:
# {
#   "detail": "You don't have permission to view this order"
# }
```

#### Scenario 4: Admin Viewing All Orders
```bash
ADMIN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Should return all orders
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/v1/orders

# Response:
# [
#   {
#     "id": 1,
#     "artisan_name": "Artisan 1",
#     ...
#   }
# ]
```

#### Scenario 5: Admin Updating Order
```bash
ADMIN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Admin can update any order
curl -X PATCH http://localhost:8000/api/v1/orders/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Response: Order updated successfully
```

#### Scenario 6: Artisan Updating Own Order
```bash
ARTISAN1_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Artisan can update their own order
curl -X PATCH http://localhost:8000/api/v1/orders/1/status \
  -H "Authorization: Bearer $ARTISAN1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispatched"}'

# Response: Order updated successfully
```

#### Scenario 7: Artisan Updating Other's Order
```bash
ARTISAN2_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Should return 403
curl -X PATCH http://localhost:8000/api/v1/orders/1/status \
  -H "Authorization: Bearer $ARTISAN2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispatched"}'

# Response:
# {
#   "detail": "Only the artisan or admin can update this order"
# }
```

## Frontend Integration

### React Hook: `useArtisanOrders`

```typescript
const { 
  orders,           // Filtered by RLS
  isLoading,
  isError,
  error,
  refetch,
  updateOrderStatus,  // Mutation
  getOrderDetail
} = useArtisanOrders();
```

### Component: `ArtisanOrdersDashboard`

- Displays orders with RLS
- Shows earnings
- Allows status updates
- Displays statistics

```tsx
<ArtisanOrdersDashboard />
```

## Security Considerations

### ✅ What's Protected
- Artisans cannot see other artisans' orders
- Buyers cannot modify orders
- Unauthenticated users cannot access orders
- Order status changes are restricted

### ✅ JWT Token Security
- Tokens are validated on every request
- Tokens should be stored securely (httpOnly cookies in production)
- Token expiration is enforced

### ⚠️ Production Checklist
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Monitor unauthorized access attempts
- [ ] Regular security audits
- [ ] Use httpOnly cookies for JWT storage
- [ ] Implement CSRF protection
- [ ] Set secure CORS headers

## Database-Level Security

For additional security, implement database-level RLS using MySQL views:

```sql
CREATE VIEW artisan_orders AS
SELECT o.* FROM orders o
WHERE o.artisan_id = SUBSTRING_INDEX(USER(), '@', 1);
```

This provides an additional layer of protection even if the API is compromised.
