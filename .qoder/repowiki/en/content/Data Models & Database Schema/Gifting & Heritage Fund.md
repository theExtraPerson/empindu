# Gifting & Heritage Fund

<cite>
**Referenced Files in This Document**
- [models.py](file://backend/apps/gifting/models.py)
- [models.py](file://backend/apps/heritage/models.py)
- [models.py](file://backend/apps/orders/models.py)
- [models.py](file://backend/apps/artisans/models.py)
- [models.py](file://backend/apps/products/models.py)
- [router.py](file://backend/api/v1/router.py)
- [gifting.py](file://backend/api/v1/gifting.py)
- [orders.py](file://backend/api/v1/orders.py)
- [router.py](file://backend/api/v1/artisans.py)
- [CorporateGifting.tsx](file://apps/web/src/pages/CorporateGifting.tsx)
- [GiftOrderTimeline.tsx](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx)
- [useCorporateGifting.tsx](file://apps/web/src/hooks/useCorporateGifting.tsx)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql)
- [send-gift-confirmation/index.ts](file://supabase/functions/send-gift-confirmation/index.ts)
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
10. [Appendices](#appendices)

## Introduction
This document describes the data models and workflows for the gifting system and the heritage fund ledger. It covers:
- Gift order structure, personalization, corporate gift management, and scheduling
- Heritage fund accounting with automated 3% levy, fund allocation tracking, and cultural preservation contributions
- Timeline implementation for gift orders, recipient management, and delivery coordination
- Financial ledger design for heritage fund transactions, audit trails, and reporting
- Integration between gifting orders and order processing workflows, including tax and compliance considerations

## Project Structure
The gifting and heritage fund functionality spans backend Django models, frontend React components, Supabase database tables and functions, and API routers.

```mermaid
graph TB
subgraph "Backend Django"
GiftingModels["apps/gifting/models.py"]
HeritageModels["apps/heritage/models.py"]
OrdersModels["apps/orders/models.py"]
ArtisansModels["apps/artisans/models.py"]
ProductsModels["apps/products/models.py"]
ApiRouter["api/v1/router.py"]
GiftingApi["api/v1/gifting.py"]
OrdersApi["api/v1/orders.py"]
ArtisansApi["api/v1/artisans.py"]
end
subgraph "Frontend React"
CorpPage["apps/web/src/pages/CorporateGifting.tsx"]
TimelineComp["apps/web/src/components/gifting/GiftOrderTimeline.tsx"]
CorpHook["apps/web/src/hooks/useCorporateGifting.tsx"]
end
subgraph "Supabase"
Mig["supabase/migrations/...sql"]
SendGiftFn["supabase/functions/send-gift-confirmation/index.ts"]
CashPayFn["supabase/functions/process-cash-payment/index.ts"]
end
ApiRouter --> GiftingApi
ApiRouter --> OrdersApi
ApiRouter --> ArtisansApi
CorpPage --> CorpHook
TimelineComp --> Mig
SendGiftFn --> Mig
CashPayFn --> Mig
```

**Diagram sources**
- [router.py:30-40](file://backend/api/v1/router.py#L30-L40)
- [gifting.py:1-13](file://backend/api/v1/gifting.py#L1-L13)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)
- [CorporateGifting.tsx:1-396](file://apps/web/src/pages/CorporateGifting.tsx#L1-L396)
- [GiftOrderTimeline.tsx:1-85](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx#L1-L85)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)
- [send-gift-confirmation/index.ts:1-219](file://supabase/functions/send-gift-confirmation/index.ts#L1-L219)
- [process-cash-payment/index.ts:1-114](file://supabase/functions/process-cash-payment/index.ts#L1-L114)

**Section sources**
- [router.py:30-40](file://backend/api/v1/router.py#L30-L40)
- [CorporateGifting.tsx:1-396](file://apps/web/src/pages/CorporateGifting.tsx#L1-L396)
- [GiftOrderTimeline.tsx:1-85](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx#L1-L85)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

## Core Components
- GiftDetails: Personalization and scheduling for individual gift orders
- GiftOrder: Aggregated corporate/bulk gift orders
- Order: Full lifecycle for retail and gift orders, including heritage fund amounts
- HeritageFundEntry: Immutable ledger entries for heritage fund transactions
- Distribution: Proposed, approved, and executed distributions to craft communities
- CraftTradition: Cultural anchor with heritage fund levy percentage
- Product: Pricing and revenue split including heritage fund contribution
- Supabase tables: corporate gift orders, items, recipients, and gift order status history
- Supabase functions: gift confirmation email and cash-on-delivery payment processor

**Section sources**
- [models.py:9-67](file://backend/apps/gifting/models.py#L9-L67)
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [models.py:9-66](file://backend/apps/heritage/models.py#L9-L66)
- [models.py:14-45](file://backend/apps/artisans/models.py#L14-L45)
- [models.py:10-99](file://backend/apps/products/models.py#L10-L99)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)
- [send-gift-confirmation/index.ts:1-219](file://supabase/functions/send-gift-confirmation/index.ts#L1-L219)
- [process-cash-payment/index.ts:1-114](file://supabase/functions/process-cash-payment/index.ts#L1-L114)

## Architecture Overview
The gifting system integrates frontend forms with Supabase tables and functions, and connects to the order lifecycle and heritage fund ledger via Django models and API routers.

```mermaid
sequenceDiagram
participant User as "User"
participant Web as "CorporateGifting Page"
participant Hook as "useCorporateGifting Hook"
participant Supa as "Supabase Functions"
participant DB as "Supabase Tables"
User->>Web : Fill corporate gift form
Web->>Hook : Submit order payload
Hook->>Supa : Invoke send-gift-confirmation
Supa->>DB : Insert corporate_gift_orders/items/recipients
DB-->>Supa : Confirm records
Supa-->>Hook : Success response
Hook-->>Web : Show confirmation
```

**Diagram sources**
- [CorporateGifting.tsx:83-99](file://apps/web/src/pages/CorporateGifting.tsx#L83-L99)
- [useCorporateGifting.tsx](file://apps/web/src/hooks/useCorporateGifting.tsx)
- [send-gift-confirmation/index.ts:15-219](file://supabase/functions/send-gift-confirmation/index.ts#L15-L219)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

## Detailed Component Analysis

### Gift Order Data Model
- GiftDetails captures recipient identity, relationship, occasion, personal message, gift wrap preference, and optional scheduled delivery date.
- GiftOrder aggregates bulk orders with customer/company info, totals, status, and timestamps.

```mermaid
classDiagram
class GiftDetails {
+string recipient_name
+string recipient_relationship
+string occasion
+text personal_message
+boolean gift_wrap
+date scheduled_delivery_date
}
class GiftOrder {
+string customer_name
+string customer_email
+string company
+integer total_items
+decimal total_amount_ugx
+string status
+text notes
+datetime created_at
+datetime updated_at
}
GiftOrder --> GiftDetails : "relates to"
```

**Diagram sources**
- [models.py:9-67](file://backend/apps/gifting/models.py#L9-L67)

**Section sources**
- [models.py:9-67](file://backend/apps/gifting/models.py#L9-L67)

### Order Lifecycle and Heritage Fund Ledger
- Order includes buyer, artisan, product, quantities, frozen financial snapshots, gift flag, gift details linkage, payment metadata, shipping, and timestamps.
- HeritageFundEntry records immutable ledger entries for every completed order, linking to Order and CraftTradition, with entry type, amount, and description.
- Distribution tracks proposed/approved distributions to communities with status, purpose, beneficiaries, approvals, and timing.

```mermaid
classDiagram
class Order {
+string status
+string payout_status
+boolean is_gift
+integer quantity
+decimal price_ugx
+decimal price_usd
+decimal artisan_earnings_ugx
+decimal platform_commission_ugx
+decimal heritage_fund_ugx
+string payment_method
+string payment_reference
+json shipping_address
+string shipping_country
+string tracking_number
+datetime created_at
+datetime paid_at
+datetime dispatched_at
+datetime delivered_at
}
class HeritageFundEntry {
+string entry_type
+decimal amount_ugx
+text description
+datetime created_at
}
class Distribution {
+string status
+decimal amount_ugx
+text purpose
+text beneficiaries
+datetime distributed_at
+datetime created_at
}
Order "1" --> "1" GiftDetails : "links via gift_details"
Order "1" --> "many" HeritageFundEntry : "creates"
Distribution --> CraftTradition : "targets"
```

**Diagram sources**
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [models.py:9-66](file://backend/apps/heritage/models.py#L9-L66)
- [models.py:14-45](file://backend/apps/artisans/models.py#L14-L45)

**Section sources**
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [models.py:9-66](file://backend/apps/heritage/models.py#L9-L66)
- [models.py:14-45](file://backend/apps/artisans/models.py#L14-L45)

### Product Pricing and Heritage Fund Calculation
- Product defines pricing tiers and revenue split percentages (artisan share, heritage fund, platform).
- Unit-level heritage fund contribution is computed per product and scaled by quantity in Order.calculate_totals.

```mermaid
flowchart TD
Start(["Order.calculate_totals"]) --> Price["Compute price_ugx/usd"]
Price --> Artisan["Compute artisan_earnings_ugx"]
Price --> Platform["Compute platform_commission_ugx"]
Price --> Heritage["Compute heritage_fund_ugx"]
Artisan --> Done(["Totals frozen"])
Platform --> Done
Heritage --> Done
```

**Diagram sources**
- [models.py:55-99](file://backend/apps/products/models.py#L55-L99)
- [models.py:111-122](file://backend/apps/orders/models.py#L111-L122)

**Section sources**
- [models.py:55-99](file://backend/apps/products/models.py#L55-L99)
- [models.py:111-122](file://backend/apps/orders/models.py#L111-L122)

### Corporate Gifting Workflow (Frontend)
- The CorporateGifting page guides users through company details, product selection, customization, and recipient management.
- useCorporateGifting handles submission to Supabase functions and manages state transitions.

```mermaid
sequenceDiagram
participant User as "User"
participant Page as "CorporateGifting Page"
participant Hook as "useCorporateGifting"
participant Func as "send-gift-confirmation"
participant DB as "corporate_gift_* tables"
User->>Page : Enter details and recipients
Page->>Hook : submitGiftOrder(payload)
Hook->>Func : POST gift confirmation
Func->>DB : Insert orders/items/recipients
DB-->>Func : OK
Func-->>Hook : Success
Hook-->>Page : Show confirmation
```

**Diagram sources**
- [CorporateGifting.tsx:83-99](file://apps/web/src/pages/CorporateGifting.tsx#L83-L99)
- [useCorporateGifting.tsx](file://apps/web/src/hooks/useCorporateGifting.tsx)
- [send-gift-confirmation/index.ts:15-219](file://supabase/functions/send-gift-confirmation/index.ts#L15-L219)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

**Section sources**
- [CorporateGifting.tsx:1-396](file://apps/web/src/pages/CorporateGifting.tsx#L1-L396)
- [useCorporateGifting.tsx](file://apps/web/src/hooks/useCorporateGifting.tsx)

### Gift Order Timeline (Frontend)
- GiftOrderTimeline queries Supabase’s gift order status history table and renders a chronological timeline with icons and timestamps.

```mermaid
sequenceDiagram
participant UI as "GiftOrderTimeline"
participant Supa as "Supabase"
participant Hist as "gift_order_status_history"
UI->>Supa : SELECT history by gift_order_id
Supa->>Hist : Query ordered by created_at
Hist-->>Supa : Rows
Supa-->>UI : Render timeline dots and notes
```

**Diagram sources**
- [GiftOrderTimeline.tsx:21-32](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx#L21-L32)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:1-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L1-L130)

**Section sources**
- [GiftOrderTimeline.tsx:1-85](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx#L1-L85)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:1-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L1-L130)

### Delivery Coordination and Cash Payments
- process-cash-payment creates a payment record for cash on delivery/pickup, updates order status, and returns delivery/pickup details.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Fn as "process-cash-payment"
participant DB as "Supabase DB"
Client->>Fn : POST cash payment details
Fn->>DB : INSERT payments (cash)
Fn->>DB : UPDATE orders (status=confirmed)
DB-->>Fn : OK
Fn-->>Client : {success, transactionRef, message}
```

**Diagram sources**
- [process-cash-payment/index.ts:19-114](file://supabase/functions/process-cash-payment/index.ts#L19-L114)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

**Section sources**
- [process-cash-payment/index.ts:1-114](file://supabase/functions/process-cash-payment/index.ts#L1-L114)

### API Integration
- API v1 router registers artisan, product, order, and gifting endpoints with JWT authentication for protected routes.

```mermaid
graph LR
Router["api/v1/router.py"] --> Artisans["api/v1/artisans.py"]
Router --> Orders["api/v1/orders.py"]
Router --> Gifting["api/v1/gifting.py"]
```

**Diagram sources**
- [router.py:30-40](file://backend/api/v1/router.py#L30-L40)
- [gifting.py:1-13](file://backend/api/v1/gifting.py#L1-L13)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)

**Section sources**
- [router.py:30-40](file://backend/api/v1/router.py#L30-L40)
- [gifting.py:1-13](file://backend/api/v1/gifting.py#L1-L13)
- [orders.py:1-18](file://backend/api/v1/orders.py#L1-L18)

## Dependency Analysis
- GiftDetails is linked from Order via a OneToOneField when is_gift is true.
- HeritageFundEntry references Order and CraftTradition, enabling cross-tradition fund tracking.
- Product heritage_pct drives Order.heritage_fund_ugx via calculate_totals.
- Supabase tables support corporate gift orders, items, and recipients; functions integrate with frontend flows.

```mermaid
graph TB
GiftDetails["gifting.GiftDetails"] --> Order["orders.Order"]
Product["products.Product"] --> Order
CraftTradition["artisans.CraftTradition"] --> HeritageFundEntry["heritage.HeritageFundEntry"]
Order --> HeritageFundEntry
SupaOrders["corporate_gift_orders"] --> SupaItems["corporate_gift_items"]
SupaOrders --> SupaRecipients["corporate_gift_recipients"]
SupaItems --> SupaProducts["products"]
```

**Diagram sources**
- [models.py:64-72](file://backend/apps/orders/models.py#L64-L72)
- [models.py:55-99](file://backend/apps/products/models.py#L55-L99)
- [models.py:20-27](file://backend/apps/heritage/models.py#L20-L27)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

**Section sources**
- [models.py:64-72](file://backend/apps/orders/models.py#L64-L72)
- [models.py:55-99](file://backend/apps/products/models.py#L55-L99)
- [models.py:20-27](file://backend/apps/heritage/models.py#L20-L27)
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)

## Performance Considerations
- Use database indexes on frequently queried fields (e.g., order status, created_at, product craft_tradition).
- Batch retrieval of related entities (items, recipients) to minimize round trips in Supabase functions.
- Cache immutable product and craft tradition metadata on the frontend to reduce repeated network requests.
- Optimize Supabase policies to limit returned columns and apply row-level security efficiently.

## Troubleshooting Guide
- Gift confirmation emails: Verify Supabase function receives a valid bearer token, order ownership matches the authenticated user, and required fields exist before sending.
- Cash payment processing: Ensure order exists, payment record inserts successfully, and order status updates; handle pickup location resolution when applicable.
- Timeline rendering: Confirm gift_order_status_history exists and is ordered by created_at ascending; handle missing data gracefully.

**Section sources**
- [send-gift-confirmation/index.ts:35-74](file://supabase/functions/send-gift-confirmation/index.ts#L35-L74)
- [process-cash-payment/index.ts:44-72](file://supabase/functions/process-cash-payment/index.ts#L44-L72)
- [GiftOrderTimeline.tsx:21-32](file://apps/web/src/components/gifting/GiftOrderTimeline.tsx#L21-L32)

## Conclusion
The gifting system combines Supabase-managed corporate gift workflows with Django-backed order and heritage fund accounting. Automated heritage fund levies, immutable ledger entries, and distribution tracking support cultural preservation and transparent impact reporting. Frontend components streamline corporate gift ordering, personalization, and timeline visibility, while backend models and APIs ensure robust integration and compliance-ready financial flows.

## Appendices

### Data Model Definitions

```mermaid
erDiagram
CORPORATE_GIFT_ORDERS {
uuid id PK
uuid user_id
string company_name
string contact_name
string contact_email
string contact_phone
string occasion
string budget_range
date delivery_date
text gift_message
text branding_notes
integer recipient_count
string status
text notes
timestamptz created_at
timestamptz updated_at
}
CORPORATE_GIFT_ITEMS {
uuid id PK
uuid gift_order_id FK
uuid product_id FK
integer quantity
numeric unit_price
text personalization
timestamptz created_at
}
CORPORATE_GIFT_RECIPIENTS {
uuid id PK
uuid gift_order_id FK
string name
string email
string phone
text address
string city
text personal_message
timestamptz created_at
}
ORDERS {
uuid id PK
uuid product_id FK
uuid buyer_id FK
uuid artisan_id FK
boolean is_gift
uuid gift_details_id FK
string status
string payout_status
integer quantity
numeric price_ugx
numeric price_usd
numeric artisan_earnings_ugx
numeric platform_commission_ugx
numeric heritage_fund_ugx
string payment_method
string payment_reference
json shipping_address
string shipping_country
string tracking_number
timestamptz created_at
timestamptz paid_at
timestamptz dispatched_at
timestamptz delivered_at
}
PRODUCTS {
uuid id PK
uuid artisan_id FK
uuid craft_tradition_id FK
string slug
string name
numeric price_ugx
numeric price_usd
numeric artisan_pct
numeric heritage_pct
numeric platform_pct
integer stock
string status
timestamptz created_at
timestamptz updated_at
}
ARTISANS {
uuid id PK
uuid user_id FK
uuid craft_tradition_id FK
string slug
text bio
string community
string district
string phone
string momo_number
string telegram_chat_id
boolean is_certified
string onboarded_via
integer years_experience
timestamptz created_at
timestamptz updated_at
}
CRAFT_TRADITIONS {
uuid id PK
string name
string ethnic_group
string region
text description
string gi_status
numeric heritage_fund_levy_pct
timestamptz created_at
}
HERITAGE_FUND_ENTRIES {
uuid id PK
uuid order_id FK
string entry_type
numeric amount_ugx
uuid craft_tradition_id FK
text description
timestamptz created_at
}
DISTRIBUTIONS {
uuid id PK
uuid craft_tradition_id FK
numeric amount_ugx
text purpose
text beneficiaries
string status
uuid approved_by_id FK
timestamptz distributed_at
timestamptz created_at
}
CORPORATE_GIFT_ORDERS ||--o{ CORPORATE_GIFT_ITEMS : "contains"
CORPORATE_GIFT_ORDERS ||--o{ CORPORATE_GIFT_RECIPIENTS : "has"
PRODUCTS ||--o{ ORDERS : "ordered_in"
ARTISANS ||--o{ PRODUCTS : "creates"
CRAFT_TRADITIONS ||--o{ PRODUCTS : "anchors"
ORDERS ||--o{ HERITAGE_FUND_ENTRIES : "generates"
CRAFT_TRADITIONS ||--o{ HERITAGE_FUND_ENTRIES : "targeted_by"
CRAFT_TRADITIONS ||--o{ DISTRIBUTIONS : "funds"
```

**Diagram sources**
- [20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql:64-130](file://supabase/migrations/20260301183140_74b1e32e-ded4-4234-9c49-76542f291b2d.sql#L64-L130)
- [models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [models.py:10-99](file://backend/apps/products/models.py#L10-L99)
- [models.py:14-45](file://backend/apps/artisans/models.py#L14-L45)
- [models.py:9-66](file://backend/apps/heritage/models.py#L9-L66)