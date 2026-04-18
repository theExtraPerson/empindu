# Artisan Model

<cite>
**Referenced Files in This Document**
- [models.py](file://backend/apps/artisans/models.py)
- [0001_initial.py](file://backend/apps/artisans/migrations/0001_initial.py)
- [artisans.py](file://backend/api/v1/artisans.py)
- [BusinessRegistration.tsx](file://src/components/business/BusinessRegistration.tsx)
- [ArtisanProfile.tsx](file://src/pages/ArtisanProfile.tsx)
- [MIGRATION_GUIDE.md](file://MIGRATION_GUIDE.md)
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
This document provides comprehensive data model documentation for the Artisan entity within the Empindu platform. It details the complete field definitions, relationships with the User, CraftTradition, and Certification models, artisan onboarding workflows across multiple channels, multilingual content support, automatic slug generation, status tracking, and analytics properties. It also outlines utility methods and operational considerations for managing artisan records at scale.

## Project Structure
The Artisan model resides in the backend Django application under the artisans app. Supporting migration files define database schema, while API endpoints expose artisan data to the frontend. Frontend components integrate with the API to render artisan profiles and support registration flows.

```mermaid
graph TB
subgraph "Backend"
A["Artisan Model<br/>backend/apps/artisans/models.py"]
B["CraftTradition Model<br/>backend/apps/artisans/models.py"]
C["Certification Model<br/>backend/apps/artisans/models.py"]
D["Migration: Initial Schema<br/>backend/apps/artisans/migrations/0001_initial.py"]
E["API Endpoints<br/>backend/api/v1/artisans.py"]
end
subgraph "Frontend"
F["Business Registration<br/>src/components/business/BusinessRegistration.tsx"]
G["Artisan Profile Page<br/>src/pages/ArtisanProfile.tsx"]
end
A --> B
A --> C
D --> A
D --> B
D --> C
E --> A
F --> E
G --> E
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)
- [0001_initial.py](file://backend/apps/artisans/migrations/0001_initial.py)
- [artisans.py](file://backend/api/v1/artisans.py)
- [BusinessRegistration.tsx](file://src/components/business/BusinessRegistration.tsx)
- [ArtisanProfile.tsx](file://src/pages/ArtisanProfile.tsx)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)
- [0001_initial.py](file://backend/apps/artisans/migrations/0001_initial.py)
- [artisans.py](file://backend/api/v1/artisans.py)
- [BusinessRegistration.tsx](file://src/components/business/BusinessRegistration.tsx)
- [ArtisanProfile.tsx](file://src/pages/ArtisanProfile.tsx)

## Core Components
This section documents the Artisan model and related entities, focusing on identity, biographical data, location, contact information, certification tracking, media assets, analytics properties, and utility methods.

- Identity
  - user: One-to-one relationship to the User model via a related_name constraint.
  - slug: Unique URL-friendly identifier generated automatically from the artisan's full name.
  - craft_tradition: Foreign key to CraftTradition with PROTECT deletion to maintain referential integrity.
  - certifications: Many-to-many relationship to Certification with related_name for reverse queries.

- Biographical Information (Multilingual Support)
  - bio: Primary biography written in the artisan's voice.
  - bio_luganda: Luganda translation of the biography.
  - bio_swahili: Swahili translation of the biography.
  - bio_draft: Optional voice transcription draft awaiting review.
  - bio_draft_language: Language code indicating the draft's source language.
  - bio_draft_at: Timestamp marking when the draft was created.

- Location Data
  - community: Settlement or locality (e.g., village or town).
  - district: Administrative district.

- Contact Information
  - phone: Primary phone number (used as WhatsApp number).
  - momo_number: MTN Mobile Money number.
  - airtel_number: Airtel Money number.
  - telegram_chat_id: Telegram chat identifier for bot communication.

- Status Tracking
  - is_certified: Boolean flag indicating certification status.
  - onboarded_via: Choice field representing the onboarding channel (web, whatsapp, telegram, field).
  - is_active: Boolean flag controlling visibility and activity.

- Media Assets
  - profile_photo: Image field for the artisan's profile picture.
  - cover_photo: Image field for the artisan's cover photo.

- Experience and Metadata
  - years_experience: Positive integer representing professional experience in years.
  - created_at, updated_at: Auto-populated timestamps for record lifecycle.

- Analytics Properties
  - total_earnings_ugx: Sum of paid artisan earnings from delivered orders.
  - order_count: Count of delivered orders attributed to the artisan.

- Utility Methods
  - full_name: Computed property returning the user's full name or username fallback.
  - has_voice_draft: Boolean check for presence of a voice transcription draft.
  - save: Overrides to auto-generate slug from the artisan's full name, ensuring uniqueness.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)
- [0001_initial.py](file://backend/apps/artisans/migrations/0001_initial.py)

## Architecture Overview
The Artisan model integrates with the User model to establish digital identity, anchors cultural IP through CraftTradition associations, and tracks quality assurance via Certification relationships. Onboarding occurs across multiple channels, and analytics derive insights from the Orders model.

```mermaid
classDiagram
class User {
+uuid id
+string full_name
+string username
+datetime created_at
}
class CraftTradition {
+uuid id
+string name
+string name_luganda
+string ethnic_group
+string region
+string description
+enum gi_status
+decimal heritage_fund_levy_pct
+datetime created_at
}
class Certification {
+uuid id
+string name
+text description
+text requirements
+boolean is_active
+datetime created_at
}
class Artisan {
+uuid id
+uuid user_id
+string slug
+uuid craft_tradition_id
+text bio
+text bio_luganda
+text bio_swahili
+text bio_draft
+string bio_draft_language
+datetime bio_draft_at
+string community
+string district
+string phone
+string momo_number
+string airtel_number
+bigint telegram_chat_id
+boolean is_certified
+enum onboarded_via
+boolean is_active
+image profile_photo
+image cover_photo
+smallint years_experience
+datetime created_at
+datetime updated_at
+full_name()
+total_earnings_ugx()
+order_count()
+has_voice_draft()
+save()
}
Artisan --> User : "OneToOne"
Artisan --> CraftTradition : "ForeignKey"
Artisan --> Certification : "ManyToMany"
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)
- [0001_initial.py](file://backend/apps/artisans/migrations/0001_initial.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

## Detailed Component Analysis

### Identity Fields
- user: Links the artisan to a platform user account, enabling authentication and profile management.
- slug: Automatically generated from the artisan's full name; collisions are resolved by appending a counter.
- craft_tradition: Establishes cultural IP anchoring by associating the artisan with a named craft tradition.

```mermaid
sequenceDiagram
participant Admin as "Admin"
participant API as "API Endpoint"
participant Model as "Artisan Model"
participant DB as "Database"
Admin->>API : "Create Artisan Request"
API->>Model : "Instantiate Artisan"
Model->>Model : "Generate slug from full_name"
Model->>DB : "Save record"
DB-->>API : "Success"
API-->>Admin : "Artisan Created"
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)
- [artisans.py](file://backend/api/v1/artisans.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Biographical Information and Multilingual Support
- Primary biography supports three languages: English (bio), Luganda (bio_luganda), and Swahili (bio_swahili).
- Voice transcription drafts are supported with language tagging and timestamps for editorial workflows.

```mermaid
flowchart TD
Start(["Draft Submission"]) --> Capture["Capture Voice Note"]
Capture --> Transcribe["Transcribe to Text"]
Transcribe --> TagLang["Tag Language"]
TagLang --> StoreDraft["Store bio_draft + metadata"]
StoreDraft --> Review["Editor Review"]
Review --> Approve{"Approved?"}
Approve --> |Yes| Publish["Publish to bio/bio_luganda/bio_swahili"]
Approve --> |No| Revise["Revise Draft"]
Revise --> Transcribe
Publish --> End(["Complete"])
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Location Data
- community: Settlement or locality for geographic targeting.
- district: Administrative boundary for regional analytics and logistics.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Contact Information
- phone: Primary contact used for WhatsApp communications.
- momo_number: MTN Mobile Money for financial transactions.
- airtel_number: Airtel Money as an alternate payment method.
- telegram_chat_id: Telegram chat identifier for bot-based onboarding and support.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Certification Tracking
- certifications: Many-to-many relationship enabling multiple certifications and reverse lookups from Certification to Artisan.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Media Assets
- profile_photo: Uploads to a dedicated directory for profile representation.
- cover_photo: Uploads to a dedicated directory for promotional visuals.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Analytics Properties
- total_earnings_ugx: Aggregates paid artisan earnings from delivered orders.
- order_count: Counts delivered orders attributed to the artisan.

```mermaid
sequenceDiagram
participant API as "API"
participant Model as "Artisan"
participant Orders as "Orders Model"
participant DB as "Database"
API->>Model : "Access total_earnings_ugx"
Model->>Orders : "Filter delivered orders with paid payout"
Orders->>DB : "Aggregate artisan_earnings_ugx"
DB-->>Orders : "Sum"
Orders-->>Model : "Total Amount"
Model-->>API : "Return value"
API->>Model : "Access order_count"
Model->>Orders : "Filter delivered orders"
Orders->>DB : "Count"
DB-->>Orders : "Count"
Orders-->>Model : "Count"
Model-->>API : "Return count"
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Utility Methods
- full_name: Returns the user's full name or username fallback.
- has_voice_draft: Indicates whether a voice draft exists.
- save: Auto-generates slug from full_name and ensures uniqueness.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Onboarding Workflows Across Channels
Onboarding occurs through four channels: web, WhatsApp, Telegram, and field officers. The choice is recorded in the onboarded_via field.

```mermaid
flowchart TD
Start(["User Initiates Onboarding"]) --> Channel{"Select Channel"}
Channel --> Web["Web Form"]
Channel --> WhatsApp["WhatsApp"]
Channel --> Telegram["Telegram Bot"]
Channel --> Field["Field Officer"]
Web --> Create["Create Artisan Record"]
WhatsApp --> Create
Telegram --> Create
Field --> Create
Create --> Verify["Verify Contact & Location"]
Verify --> Activate{"Ready to Activate?"}
Activate --> |Yes| Active["Mark is_active = True"]
Activate --> |No| Review["Review & Edit"]
Review --> Verify
Active --> End(["Onboarded"])
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Relationship with CraftTradition and Certification
- CraftTradition association establishes cultural IP anchoring and enables regional analytics.
- Certification linkage supports quality assurance and marketing differentiation.

```mermaid
erDiagram
USER {
uuid id PK
string full_name
string username
}
ARTISAN {
uuid id PK
uuid user_id FK
string slug UK
uuid craft_tradition_id FK
}
CRAFT_TRADITION {
uuid id PK
string name
string name_luganda
string ethnic_group
string region
}
CERTIFICATION {
uuid id PK
string name
}
ARTISAN_CERTIFICATIONS {
uuid artisan_id FK
uuid certification_id FK
}
USER ||--o| ARTISAN : "one_to_one"
ARTISAN }o--|| CRAFT_TRADITION : "foreign_key"
ARTISAN }o--o{ CERTIFICATION : "many_to_many"
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

### Frontend Integration
- Business Registration component supports initial artisan onboarding and data capture.
- Artisan Profile page consumes API data to render profile details and analytics.

**Section sources**
- [BusinessRegistration.tsx](file://src/components/business/BusinessRegistration.tsx)
- [ArtisanProfile.tsx](file://src/pages/ArtisanProfile.tsx)

## Dependency Analysis
The Artisan model depends on the User model for identity, CraftTradition for cultural IP anchoring, and Certification for quality assurance. Analytics depend on the Orders model. The slug generation mechanism ensures unique URLs for artisan profiles.

```mermaid
graph TB
User["User Model"] --> Artisan["Artisan Model"]
CraftTradition["CraftTradition Model"] --> Artisan
Certification["Certification Model"] --> Artisan
Orders["Orders Model"] --> Artisan
Artisan --> Slug["Slug Generation"]
```

**Diagram sources**
- [models.py](file://backend/apps/artisans/models.py)

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

## Performance Considerations
- Slug generation: The save override iterates until a unique slug is found; for high-volume onboarding, consider precomputing slugs with collision checks to reduce database writes.
- Analytics aggregation: total_earnings_ugx and order_count queries traverse delivered orders; ensure appropriate indexing on status and payout fields for scalability.
- Media storage: Separate directories for profile and cover photos improve organization; consider CDN integration for global delivery.

## Troubleshooting Guide
- Slug conflicts: If slug generation fails due to duplicates, verify the uniqueness logic and confirm slug length limits.
- Missing full_name: The full_name property falls back to username; ensure user profiles are complete.
- Draft review pipeline: Confirm voice draft language tagging and timestamps are populated during transcription workflows.
- Certification linkage: Validate many-to-many relationships when assigning certifications to artisans.

**Section sources**
- [models.py](file://backend/apps/artisans/models.py)

## Conclusion
The Artisan model encapsulates the digital identity of Ugandan artisans, linking them to cultural IP through CraftTradition, supporting multilingual storytelling, and enabling channel-based onboarding. Its analytics properties and utility methods facilitate commerce, marketing, and platform operations. Proper indexing, slug generation strategies, and media optimization will ensure robust performance at scale.