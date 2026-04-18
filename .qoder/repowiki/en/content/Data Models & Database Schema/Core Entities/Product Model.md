# Product Model

<cite>
**Referenced Files in This Document**
- [models.py](file://backend/apps/products/models.py)
- [products.py](file://backend/api/v1/products.py)
- [0001_initial.py](file://backend/apps/products/migrations/0001_initial.py)
- [artisans/models.py](file://backend/apps/artisans/models.py)
- [orders/models.py](file://backend/apps/orders/models.py)
- [docker-compose.yml](file://infrastructure/docker-compose.yml)
- [README.md](file://README.md)
- [YouMightAlsoLike.tsx](file://apps/web/src/components/recommendations/YouMightAlsoLike.tsx)
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
This document provides comprehensive data model documentation for the Product entity in Empindu's story-first architecture. It covers product metadata, multilingual story content, provenance tracking, semantic embeddings for AI-powered discovery, pricing and revenue sharing, inventory management, relationships with Artisan models, craft tradition anchoring, lifecycle management, visibility controls, image/media handling, recommendation system integration, and analytics considerations.

## Project Structure
The Product model is part of the Django application ecosystem with supporting components across artisans, orders, search, and ML domains. The backend leverages PostgreSQL with pgvector for embeddings, Redis for caching and Celery for asynchronous tasks, and Meilisearch for semantic search.

```mermaid
graph TB
subgraph "Backend"
A["Products App<br/>models.py"]
B["Artisans App<br/>models.py"]
C["Orders App<br/>models.py"]
D["API v1<br/>products.py"]
E["Search Infrastructure<br/>docker-compose.yml"]
end
subgraph "Frontend"
F["Recommendations<br/>YouMightAlsoLike.tsx"]
end
A --> B
A --> C
D --> A
D --> B
F --> D
E --> A
```

**Diagram sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [products.py:1-191](file://backend/api/v1/products.py#L1-L191)
- [docker-compose.yml:1-51](file://infrastructure/docker-compose.yml#L1-L51)
- [YouMightAlsoLike.tsx:1-50](file://apps/web/src/components/recommendations/YouMightAlsoLike.tsx#L1-L50)

**Section sources**
- [README.md:1-242](file://README.md#L1-L242)
- [docker-compose.yml:1-51](file://infrastructure/docker-compose.yml#L1-L51)

## Core Components
The Product model encapsulates the story-first product architecture with cultural IP anchoring. It includes identity fields, multilingual story content, craft details, pricing and revenue splits, inventory, customization options, shipping attributes, semantic embeddings, timestamps, and relationships to Artisan and CraftTradition models. The ProvenanceRecord model captures immutable cultural attribution snapshots linked to each product.

Key fields and relationships:
- Identity: slug, name, multilingual name variants
- Story: primary and multilingual narrative fields, draft transcription fields
- Craft Details: material, technique, estimated days to make
- Pricing & Revenue: UGX/USD prices, artisan/share percentages, platform commission
- Inventory & Status: stock count, lifecycle status (draft, active, sold_out, archived)
- Customization & Shipping: customization flag, weight in grams
- Embeddings: pgvector field for semantic search
- Relationships: ForeignKey to Artisan and CraftTradition, OneToOne to ProvenanceRecord
- Media: ProductPhoto model with hero image selection and captions

**Section sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [0001_initial.py:16-87](file://backend/apps/products/migrations/0001_initial.py#L16-L87)

## Architecture Overview
Empindu's Product model participates in a layered architecture:
- Data Access Layer: Django ORM models with PostgreSQL/pgvector
- API Layer: django-ninja endpoints serving product catalog and details
- Asynchronous Layer: Celery workers for embedding generation and background tasks
- Search Layer: Meilisearch for faceted discovery and semantic search
- Presentation Layer: Next.js frontend consuming the API and rendering product pages

```mermaid
sequenceDiagram
participant Client as "Next.js Frontend"
participant API as "Products API (django-ninja)"
participant ORM as "Django ORM"
participant DB as "PostgreSQL + pgvector"
participant Search as "Meilisearch"
Client->>API : GET /api/v1/products/{slug}
API->>ORM : Product.objects.select_related(...).prefetch_related(...)
ORM->>DB : SELECT product with related data
DB-->>ORM : Product + Provenance + Photos
ORM-->>API : Product data
API-->>Client : JSON response (ProductDetailOut)
Client->>API : GET /api/v1/products?filters...
API->>Search : Faceted search (Meilisearch)
Search-->>API : Search results
API-->>Client : JSON response (ProductListOut[])
```

**Diagram sources**
- [products.py:74-191](file://backend/api/v1/products.py#L74-L191)
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [docker-compose.yml:36-47](file://infrastructure/docker-compose.yml#L36-L47)

**Section sources**
- [products.py:1-191](file://backend/api/v1/products.py#L1-L191)
- [README.md:3-16](file://README.md#L3-L16)

## Detailed Component Analysis

### Product Entity
The Product model defines the core attributes and behaviors for story-first product listings:
- Status Management: draft, active, sold_out, archived lifecycle states
- Revenue Calculation: artisan earnings and heritage fund contributions computed from price and percentage fields
- Multilingual Support: story content and product name with Luganda and Swahili variants
- Craft Details: materials and techniques with cultural significance
- Inventory Control: stock levels and customization flags
- Media Handling: hero image selection and ordered photo gallery
- Embedding System: pgvector field for semantic similarity search

```mermaid
classDiagram
class Product {
+SlugField slug
+CharField name
+CharField name_luganda
+TextField story
+TextField story_luganda
+TextField story_swahili
+DecimalField price_ugx
+DecimalField price_usd
+DecimalField artisan_pct
+DecimalField heritage_pct
+DecimalField platform_pct
+PositiveSmallIntegerField stock
+CharField status
+BooleanField is_customisable
+PositiveIntegerField weight_grams
+VectorField embedding
+DateTimeField created_at
+DateTimeField updated_at
+artisan_earnings_ugx() int
+heritage_fund_ugx() int
}
class ProductPhoto {
+ImageField image
+CharField caption
+BooleanField is_hero
+PositiveSmallIntegerField sort_order
}
class ProvenanceRecord {
+CharField artisan_name
+CharField community
+CharField district
+CharField craft_tradition
+CharField ethnic_group
+TextField technique_detail
+CharField material_source
+CharField gi_status
+CharField record_hash
+DateTimeField created_at
}
class Artisan {
+ForeignKey craft_tradition
+CharField full_name
}
class CraftTradition {
+CharField name
+CharField name_luganda
+CharField ethnic_group
+CharField region
+CharField gi_status
}
Product "1" --> "1" ProvenanceRecord : "has one"
Product "1" --> "*" ProductPhoto : "has many"
Product "1" --> "1" Artisan : "by"
Artisan "1" --> "1" CraftTradition : "belongs to"
```

**Diagram sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)

**Section sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [0001_initial.py:16-87](file://backend/apps/products/migrations/0001_initial.py#L16-L87)

### Provenance Tracking
The ProvenanceRecord model captures immutable cultural attribution at listing time:
- Cultural Anchor: artisan name, community, district, craft tradition, ethnic group
- Technique & Materials: detailed technique description and material sourcing
- GI Status: intellectual property registration status
- Hash: future blockchain anchoring identifier
- Timestamp: creation date for auditability

This model ensures transparency and cultural preservation by freezing key attributes when a product is listed.

**Section sources**
- [models.py:122-153](file://backend/apps/products/models.py#L122-L153)

### Embedding Vector System
The Product model includes a semantic embedding field for AI-powered discovery:
- Vector Field: pgvector VectorField with dimension 384
- Generation: planned integration with Celery workers and sentence-transformers model
- Purpose: enable semantic similarity search and recommendation systems
- Infrastructure: PostgreSQL with pgvector extension and Celery worker processes

```mermaid
flowchart TD
Start(["Product Saved"]) --> CheckEmbedding["Check if embedding exists"]
CheckEmbedding --> |No| Generate["Generate embedding from story + material + technique"]
CheckEmbedding --> |Yes| Skip["Skip generation"]
Generate --> Store["Store vector in embedding field"]
Store --> Complete["Complete"]
Skip --> Complete
```

**Diagram sources**
- [models.py:77-79](file://backend/apps/products/models.py#L77-L79)
- [docker-compose.yml:4-7](file://infrastructure/docker-compose.yml#L4-L7)

**Section sources**
- [models.py:77-79](file://backend/apps/products/models.py#L77-L79)
- [docker-compose.yml:4-7](file://infrastructure/docker-compose.yml#L4-L7)

### API Integration and Recommendations
The Products API serves both detail and listing endpoints with filtering and pagination. The frontend recommendation component integrates with the API to surface related products.

```mermaid
sequenceDiagram
participant FE as "Frontend Recommendation"
participant API as "Products API"
participant ORM as "Django ORM"
participant DB as "PostgreSQL"
FE->>API : GET /api/v1/products?filters...
API->>ORM : Filter by craft, region, price, artisan
ORM->>DB : SELECT active products with related data
DB-->>ORM : QuerySet
ORM-->>API : Paginated results
API-->>FE : ProductListOut[]
```

**Diagram sources**
- [products.py:126-191](file://backend/api/v1/products.py#L126-L191)
- [YouMightAlsoLike.tsx:12-13](file://apps/web/src/components/recommendations/YouMightAlsoLike.tsx#L12-L13)

**Section sources**
- [products.py:126-191](file://backend/api/v1/products.py#L126-L191)
- [YouMightAlsoLike.tsx:1-50](file://apps/web/src/components/recommendations/YouMightAlsoLike.tsx#L1-L50)

## Dependency Analysis
The Product model interacts with several core components across the application stack:

```mermaid
graph LR
Product["Product Model"] --> Artisan["Artisan Model"]
Product --> CraftTradition["CraftTradition Model"]
Product --> Provenance["ProvenanceRecord Model"]
Product --> ProductPhoto["ProductPhoto Model"]
Product --> Order["Order Model"]
API["Products API"] --> Product
API --> Artisan
API --> Provenance
Search["Meilisearch"] --> Product
Celery["Celery Worker"] --> Product
Redis["Redis Cache"] --> API
```

**Diagram sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [products.py:1-191](file://backend/api/v1/products.py#L1-L191)

**Section sources**
- [models.py:10-153](file://backend/apps/products/models.py#L10-L153)
- [artisans/models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [orders/models.py:10-122](file://backend/apps/orders/models.py#L10-L122)
- [products.py:1-191](file://backend/api/v1/products.py#L1-L191)

## Performance Considerations
- Embedding Computation: Offload embedding generation to Celery workers to avoid blocking API requests
- Vector Indexing: Ensure proper indexing on the embedding vector field for similarity queries
- Media Handling: Use CDN-backed ImageFields and optimize image sizes for hero and thumbnail views
- Search Optimization: Leverage Meilisearch for faceted filtering and PostgreSQL for precise joins
- Caching: Utilize Redis for API response caching and session management
- Query Optimization: Use select_related and prefetch_related to minimize N+1 queries in product listings

## Troubleshooting Guide
Common issues and resolutions:
- Embedding Generation Failures: Verify Celery worker is running and vector model is available
- pgvector Extension Issues: Confirm PostgreSQL container uses pgvector image and extension is enabled
- Meilisearch Connectivity: Check service availability and API keys in environment variables
- Image Upload Problems: Validate Cloudinary credentials and storage permissions
- API Response Delays: Monitor Redis cache hit rates and database query performance

**Section sources**
- [docker-compose.yml:4-7](file://infrastructure/docker-compose.yml#L4-L7)
- [README.md:109-145](file://README.md#L109-L145)

## Conclusion
The Product model in Empindu represents a sophisticated story-first approach to artisan commerce, integrating cultural IP anchoring, multilingual content, semantic search capabilities, and robust revenue sharing mechanisms. Its design supports scalable growth while maintaining transparency, cultural preservation, and user-centric discovery through AI-powered recommendations and traditional search faceting.