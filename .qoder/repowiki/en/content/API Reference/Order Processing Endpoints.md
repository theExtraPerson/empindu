# Order Processing Endpoints

<cite>
**Referenced Files in This Document**
- [orders.py](file://backend/api/v1/orders.py)
- [router.py](file://backend/api/v1/router.py)
- [models.py](file://backend/apps/orders/models.py)
- [products_models.py](file://backend/apps/products/models.py)
- [artisans_models.py](file://backend/apps/artisans/models.py)
- [Checkout.tsx](file://apps/web/src/pages/Checkout.tsx)
- [cartStore.ts](file://apps/web/src/stores/cartStore.ts)
- [process-momo-payment/index.ts](file://supabase/functions/process-momo-payment/index.ts)
- [process-cash-payment/index.ts](file://supabase/functions/process-cash-payment/index.ts)
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

## Introduction
This document provides comprehensive API documentation for order processing endpoints in the Empindu artisan marketplace. It covers the complete order lifecycle from cart management through checkout, payment processing, fulfillment, and delivery tracking. It also documents order status transitions, state machine handling, and the integration points with Supabase functions for payment confirmation. The documentation includes practical examples for multi-item orders, customization requests, and cash-on-delivery scenarios, along with guidance on validation, inventory checks, and error handling.

## Project Structure
The order processing system spans three layers:
- Frontend checkout flow and cart management
- Backend API v1 with router and placeholder order endpoints
- Supabase functions for payment processing and confirmation
- Django models defining the order state machine and relationships

```mermaid
graph TB
subgraph "Frontend"
UI["Checkout Page<br/>Checkout.tsx"]
Cart["Cart Store<br/>cartStore.ts"]
end
subgraph "Backend API v1"
Router["API Router<br/>router.py"]
OrdersAPI["Orders Endpoints<br/>orders.py"]
Models["Order Models<br/>models.py"]
ProductsModels["Products Models<br/>products_models.py"]
ArtisansModels["Artisans Models<br/>artisans_models.py"]
end
subgraph "Supabase Functions"
MOMO["process-momo-payment<br/>index.ts"]
CASH["process-cash-payment<br/>index.ts"]
end
UI --> Cart
UI --> Router
Router --> OrdersAPI
OrdersAPI --> Models
Models --> ProductsModels
Models --> ArtisansModels
UI --> MOMO
UI --> CASH
```

**Diagram sources**
- [router.py:1-40](file://backend/api/v1/router.py#L1-L40)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)
- [models.py:1-122](file://backend/apps/orders/models.py#L1-L122)
- [products_models.py:1-153](file://backend/apps/products/models.py#L1-L153)
- [artisans_models.py:1-170](file://backend/apps/artisans/models.py#L1-L170)
- [Checkout.tsx:1-847](file://apps/web/src/pages/Checkout.tsx#L1-L847)
- [cartStore.ts:1-115](file://apps/web/src/stores/cartStore.ts#L1-L115)
- [process-momo-payment/index.ts:1-151](file://supabase/functions/process-momo-payment/index.ts#L1-L151)
- [process-cash-payment/index.ts:1-114](file://supabase/functions/process-cash-payment/index.ts#L1-L114)

**Section sources**
- [router.py:1-40](file://backend/api/v1/router.py#L1-L40)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)
- [models.py:1-122](file://backend/apps/orders/models.py#L1-L122)
- [products_models.py:1-153](file://backend/apps/products/models.py#L1-L153)
- [artisans_models.py:1-170](file://backend/apps/artisans/models.py#L1-L170)
- [Checkout.tsx:1-847](file://apps/web/src/pages/Checkout.tsx#L1-L847)
- [cartStore.ts:1-115](file://apps/web/src/stores/cartStore.ts#L1-L115)
- [process-momo-payment/index.ts:1-151](file://supabase/functions/process-momo-payment/index.ts#L1-L151)
- [process-cash-payment/index.ts:1-114](file://supabase/functions/process-cash-payment/index.ts#L1-L114)

## Core Components
- Order model with a comprehensive status machine and financial snapshot fields
- Payment providers: Stripe, MTN MoMo, Airtel Money, TON Crypto
- Payout status tracking for artisan disbursements
- Gift order support with dedicated gift details linkage
- Multi-item order creation via order items and personalization requests
- Cart store with inventory-aware quantity updates and personalization notes
- Supabase functions for mobile money and cash-on-delivery payment processing

**Section sources**
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [Checkout.tsx:140-194](file://apps/web/src/pages/Checkout.tsx#L140-L194)
- [cartStore.ts:26-115](file://apps/web/src/stores/cartStore.ts#L26-L115)
- [process-momo-payment/index.ts:9-151](file://supabase/functions/process-momo-payment/index.ts#L9-L151)
- [process-cash-payment/index.ts:9-114](file://supabase/functions/process-cash-payment/index.ts#L9-L114)

## Architecture Overview
The order lifecycle integrates frontend cart and checkout with backend API endpoints and Supabase functions. The frontend collects shipping and payment preferences, creates orders and order items, and triggers payment functions. Payment functions update payment records and order statuses asynchronously. The backend models define the canonical order state machine and relationships.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant Checkout as "Checkout Page<br/>Checkout.tsx"
participant API as "Orders API<br/>orders.py"
participant Supa as "Supabase Functions"
participant MOMO as "process-momo-payment"
participant CASH as "process-cash-payment"
participant DB as "Database"
Client->>Checkout : "Open checkout"
Checkout->>Checkout : "Collect shipping info"
Checkout->>API : "POST /orders/create"
API->>DB : "Insert order + order_items"
DB-->>API : "Created records"
API-->>Checkout : "Order created"
Checkout->>Supa : "Invoke payment function"
alt Mobile Money
Checkout->>MOMO : "process-momo-payment"
MOMO->>DB : "Insert payment record"
MOMO->>DB : "Update order status to confirmed"
DB-->>MOMO : "Success"
MOMO-->>Checkout : "Payment initiated"
else Cash on Delivery/Pickup
Checkout->>CASH : "process-cash-payment"
CASH->>DB : "Insert payment record"
CASH->>DB : "Update order status to confirmed"
DB-->>CASH : "Success"
CASH-->>Checkout : "Confirmed"
end
Checkout-->>Client : "Order placed"
```

**Diagram sources**
- [Checkout.tsx:158-244](file://apps/web/src/pages/Checkout.tsx#L158-L244)
- [orders.py:10-18](file://backend/api/v1/orders.py#L10-L18)
- [process-momo-payment/index.ts:54-124](file://supabase/functions/process-momo-payment/index.ts#L54-L124)
- [process-cash-payment/index.ts:45-72](file://supabase/functions/process-cash-payment/index.ts#L45-L72)

## Detailed Component Analysis

### Order Model and State Machine
The Order model defines the canonical order lifecycle and financial snapshot. Key aspects:
- Status machine: pending_payment → paid → confirmed → dispatched → in_transit → delivered, with disputed and refunded states
- Payment methods: stripe, momo (MTN MoMo/Airtel Money), cash, ton
- Payout status: pending → processing → paid → failed
- Gift flag and gift details linkage
- Quantity and multi-item support via order_items
- Financial fields frozen at order time (price_ugx/usd, artisan earnings, heritage fund, platform commission)
- Shipping details with ISO country codes and tracking number
- Dispatch photo upload capability

```mermaid
stateDiagram-v2
[*] --> PendingPayment
PendingPayment --> Paid : "Payment initiated"
Paid --> Confirmed : "Artisan confirms"
Confirmed --> Dispatched : "Shipped"
Dispatched --> InTransit : "In transit"
InTransit --> Delivered : "Delivered"
Paid --> Disputed : "Dispute raised"
Confirmed --> Refunded : "Refund processed"
Disputed --> Refunded : "Resolution : refund"
Disputed --> Delivered : "Resolution : keep item"
```

**Diagram sources**
- [models.py:16-25](file://backend/apps/orders/models.py#L16-L25)

**Section sources**
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)

### Cart Management and Validation
The cart store manages items, quantities, and personalization notes with inventory awareness:
- addItem: merges existing items without conflicting personalization notes, caps quantity at stock
- updateQuantity: clamps quantity between 1 and stock
- updatePersonalization: attaches notes per item
- getTotalPrice: computes total across items
- Persists cart state locally

```mermaid
flowchart TD
Start(["Cart Operation"]) --> OpType{"Operation"}
OpType --> |Add Item| Add["addItem(product, qty, note)"]
OpType --> |Update Quantity| Qty["updateQuantity(productId, qty)"]
OpType --> |Update Personalization| Per["updatePersonalization(productId, note)"]
Add --> Merge{"Existing item<br/>without note?"}
Merge --> |Yes| CapQty["Cap to stock_quantity"]
Merge --> |No| Push["Push new item"]
Qty --> Clamp["Clamp 1..stock"]
Per --> SetNote["Set note on matching item"]
CapQty --> End(["State Updated"])
Push --> End
Clamp --> End
SetNote --> End
```

**Diagram sources**
- [cartStore.ts:32-88](file://apps/web/src/stores/cartStore.ts#L32-L88)

**Section sources**
- [cartStore.ts:26-115](file://apps/web/src/stores/cartStore.ts#L26-L115)

### Checkout Workflow and Order Creation
The checkout page orchestrates shipping selection, payment method choice, and order submission:
- Shipping step validates required fields and delivery/pickup selection
- Payment step supports mobile money (MTN/Airtel) and cash
- Creates order with shipping details, payment method, and status
- Inserts order_items for each cart item
- Creates personalization_requests for items with notes
- Invokes Supabase functions for payment processing

```mermaid
sequenceDiagram
participant UI as "Checkout.tsx"
participant Supa as "Supabase RPC"
participant DB as "Database"
UI->>UI : "Validate shipping info"
UI->>DB : "Insert order"
DB-->>UI : "Order ID"
UI->>DB : "Insert order_items"
UI->>DB : "Insert personalization_requests"
alt Mobile Money
UI->>Supa : "process-momo-payment"
Supa->>DB : "Insert payment"
Supa->>DB : "Update order to confirmed"
else Cash
UI->>Supa : "process-cash-payment"
Supa->>DB : "Insert payment"
Supa->>DB : "Update order to confirmed"
end
UI-->>UI : "Show success"
```

**Diagram sources**
- [Checkout.tsx:93-295](file://apps/web/src/pages/Checkout.tsx#L93-L295)
- [process-momo-payment/index.ts:54-124](file://supabase/functions/process-momo-payment/index.ts#L54-L124)
- [process-cash-payment/index.ts:45-72](file://supabase/functions/process-cash-payment/index.ts#L45-L72)

**Section sources**
- [Checkout.tsx:93-295](file://apps/web/src/pages/Checkout.tsx#L93-L295)

### Payment Processing Endpoints
Two Supabase functions handle payment processing:
- process-momo-payment: Validates phone number format, normalizes to international format, creates payment record, simulates provider flow, and updates order to confirmed after a delay
- process-cash-payment: Creates payment record with pending_collection status, immediately confirms order, and returns pickup/delivery instructions

```mermaid
flowchart TD
PMStart["Mobile Money Request"] --> Validate["Validate phone format"]
Validate --> |Invalid| Err["Return 400 error"]
Validate --> |Valid| Normalize["Normalize phone number"]
Normalize --> CreatePay["Insert payment record"]
CreatePay --> Simulate["Simulate provider request"]
Simulate --> Delay["Background delay"]
Delay --> UpdateOrder["Update order to confirmed"]
UpdateOrder --> Done["Return success"]
PCStart["Cash Payment Request"] --> CreateCash["Insert payment record"]
CreateCash --> ConfirmOrder["Update order to confirmed"]
ConfirmOrder --> PickOrDeliver{"Delivery or Pickup?"}
PickOrDeliver --> |Pickup| PickupMsg["Return pickup details"]
PickOrDeliver --> |Delivery| DeliverMsg["Return delivery instructions"]
PickupMsg --> Done2["Return success"]
DeliverMsg --> Done2
```

**Diagram sources**
- [process-momo-payment/index.ts:33-124](file://supabase/functions/process-momo-payment/index.ts#L33-L124)
- [process-cash-payment/index.ts:39-90](file://supabase/functions/process-cash-payment/index.ts#L39-L90)

**Section sources**
- [process-momo-payment/index.ts:9-151](file://supabase/functions/process-momo-payment/index.ts#L9-L151)
- [process-cash-payment/index.ts:9-114](file://supabase/functions/process-cash-payment/index.ts#L9-L114)

### Backend API v1 Router and Orders Endpoints
The API v1 router registers sub-routers and applies JWT authentication. The orders router currently exposes placeholder endpoints for listing and creating orders, with authentication applied.

```mermaid
graph LR
JWT["JWT Bearer Auth"] --> API["NinjaAPI"]
API --> Artisans["/artisans/ router"]
API --> Products["/products/ router"]
API --> Orders["/orders/ router (auth)"]
API --> Gifting["/gifting/ router"]
```

**Diagram sources**
- [router.py:10-39](file://backend/api/v1/router.py#L10-L39)

**Section sources**
- [router.py:1-40](file://backend/api/v1/router.py#L1-L40)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)

### Data Models and Relationships
The order domain model connects products, artisans, buyers, and gifting details, with embedded financial snapshots and shipping metadata.

```mermaid
erDiagram
ORDER {
enum status
enum payout_status
boolean is_gift
char shipping_country
char tracking_number
datetime created_at
datetime paid_at
datetime dispatched_at
datetime delivered_at
}
PRODUCT {
decimal price_ugx
decimal price_usd
smallint stock
}
ARTISAN {
char phone
char momo_number
char airtel_number
}
USER {
uuid id
}
GIFT_DETAILS {
json gift_details
}
ORDER ||--|| PRODUCT : "product"
ORDER ||--|| ARTISAN : "artisan"
ORDER }|--|| USER : "buyer"
ORDER ||--|| GIFT_DETAILS : "gift_details"
```

**Diagram sources**
- [models.py:42-98](file://backend/apps/orders/models.py#L42-L98)
- [products_models.py:56-70](file://backend/apps/products/models.py#L56-L70)
- [artisans_models.py:102-105](file://backend/apps/artisans/models.py#L102-L105)

**Section sources**
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [products_models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [artisans_models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)

## Dependency Analysis
The system exhibits layered dependencies:
- Frontend depends on Supabase RPC functions and local cart persistence
- Backend API depends on Django models for order, product, artisan, and gifting domains
- Supabase functions depend on database tables for orders, payments, and pickup locations
- Authentication flows through JWT bearer tokens to the API

```mermaid
graph TB
FE["Checkout.tsx"] --> RPC1["process-momo-payment"]
FE --> RPC2["process-cash-payment"]
RPC1 --> DB1["orders, payments"]
RPC2 --> DB1
API["orders.py"] --> Models["orders models.py"]
Models --> DB1
Models --> DB2["products models.py"]
Models --> DB3["artisans models.py"]
Router["router.py"] --> API
```

**Diagram sources**
- [Checkout.tsx:158-244](file://apps/web/src/pages/Checkout.tsx#L158-L244)
- [process-momo-payment/index.ts:23-71](file://supabase/functions/process-momo-payment/index.ts#L23-L71)
- [process-cash-payment/index.ts:25-72](file://supabase/functions/process-cash-payment/index.ts#L25-L72)
- [orders.py:5-7](file://backend/api/v1/orders.py#L5-L7)
- [models.py:42-54](file://backend/apps/orders/models.py#L42-L54)
- [products_models.py:24-29](file://backend/apps/products/models.py#L24-L29)
- [artisans_models.py:62-85](file://backend/apps/artisans/models.py#L62-L85)
- [router.py:30-39](file://backend/api/v1/router.py#L30-L39)

**Section sources**
- [Checkout.tsx:158-244](file://apps/web/src/pages/Checkout.tsx#L158-L244)
- [process-momo-payment/index.ts:23-71](file://supabase/functions/process-momo-payment/index.ts#L23-L71)
- [process-cash-payment/index.ts:25-72](file://supabase/functions/process-cash-payment/index.ts#L25-L72)
- [orders.py:5-7](file://backend/api/v1/orders.py#L5-L7)
- [models.py:42-54](file://backend/apps/orders/models.py#L42-L54)
- [products_models.py:24-29](file://backend/apps/products/models.py#L24-L29)
- [artisans_models.py:62-85](file://backend/apps/artisans/models.py#L62-L85)
- [router.py:30-39](file://backend/api/v1/router.py#L30-L39)

## Performance Considerations
- Asynchronous payment updates: Supabase functions update order status after payment initiation, avoiding long synchronous waits
- Local cart persistence: Zustand with persistence reduces server round-trips for cart operations
- Database normalization: Foreign keys and JSON fields enable efficient queries and flexible shipping data
- Pagination in product listings: Reduces payload sizes for product discovery
- Image handling: Product photos stored separately to minimize order payload sizes

## Troubleshooting Guide
Common issues and resolutions:
- Invalid phone number format: The mobile money function validates Ugandan phone numbers and returns 400 errors for invalid formats
- Payment initiation failures: Check Supabase function logs and payment record creation; ensure service role keys are configured
- Order not transitioning to confirmed: Verify background task completion and payment status updates
- Cart quantity exceeds stock: The cart store automatically caps quantities at available stock
- Missing shipping/pickup details: The checkout page validates required fields before proceeding to payment

**Section sources**
- [process-momo-payment/index.ts:33-40](file://supabase/functions/process-momo-payment/index.ts#L33-L40)
- [process-momo-payment/index.ts:68-71](file://supabase/functions/process-momo-payment/index.ts#L68-L71)
- [process-cash-payment/index.ts:59-62](file://supabase/functions/process-cash-payment/index.ts#L59-L62)
- [cartStore.ts:38-42](file://apps/web/src/stores/cartStore.ts#L38-L42)
- [Checkout.tsx:96-121](file://apps/web/src/pages/Checkout.tsx#L96-L121)

## Conclusion
The order processing system integrates a robust order state machine, frontend cart management, and Supabase-powered payment functions. The current API v1 orders endpoints are placeholders awaiting full implementation in upcoming sprints. The system supports multi-item orders, customizations via personalization requests, and flexible payment methods including mobile money and cash-on-delivery. Future enhancements should focus on implementing full order lifecycle endpoints, integrating real payment provider webhooks, and expanding audit trail capabilities.