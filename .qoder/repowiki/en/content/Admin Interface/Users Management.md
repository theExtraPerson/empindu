# Users Management

<cite>
**Referenced Files in This Document**
- [UsersManager.tsx](file://apps/web/src/components/admin/UsersManager.tsx)
- [Admin.tsx](file://apps/web/src/pages/Admin.tsx)
- [useAuth.tsx](file://apps/web/src/hooks/useAuth.tsx)
- [useAdminData.tsx](file://apps/web/src/hooks/useAdminData.tsx)
- [types.ts](file://apps/web/src/integrations/supabase/types.ts)
- [client.ts](file://apps/web/src/integrations/supabase/client.ts)
- [router.py](file://backend/api/v1/router.py)
- [admin.py](file://backend/apps/artisans/admin.py)
- [models.py](file://backend/apps/artisans/models.py)
- [middleware.py](file://backend/apps/artisans/middleware.py)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql)
- [20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql](file://supabase/migrations/20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql)
- [20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql](file://supabase/migrations/20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql)
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql)
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
This document describes the Users Management system for the platform. It covers the administrative interface for listing users, viewing profiles, assigning roles, verifying accounts, and understanding user activity through analytics. It also documents the integration with the authentication and authorization system, data privacy and compliance controls, and the UI patterns used to manage different user types (buyers, artisans, administrators).

## Project Structure
The Users Management feature spans frontend and backend components:
- Frontend admin page and manager component for user role management
- Authentication and authorization hooks
- Supabase schema and row-level security (RLS) policies
- Backend API router and artisan admin configuration

```mermaid
graph TB
subgraph "Frontend"
AdminPage["Admin Page<br/>Admin.tsx"]
UserManager["Users Manager<br/>UsersManager.tsx"]
AuthHook["Auth Hook<br/>useAuth.tsx"]
Types["Supabase Types<br/>types.ts"]
Client["Supabase Client<br/>client.ts"]
end
subgraph "Backend"
APIRouter["API Router<br/>router.py"]
ArtisanAdmin["Artisan Admin Config<br/>admin.py"]
ArtisanModel["Artisan Model<br/>models.py"]
Middleware["Unfold Context Fix Middleware<br/>middleware.py"]
end
subgraph "Supabase"
Profiles["profiles table"]
UserRoles["user_roles table"]
Policies["RLS Policies<br/>2025...sql, 2026...sql"]
end
AdminPage --> UserManager
UserManager --> Client
Client --> Profiles
Client --> UserRoles
UserManager --> Types
AuthHook --> Client
APIRouter --> ArtisanAdmin
ArtisanAdmin --> ArtisanModel
ArtisanAdmin --> Middleware
Profiles --> Policies
UserRoles --> Policies
```

**Diagram sources**
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [types.ts:937-951](file://apps/web/src/integrations/supabase/types.ts#L937-L951)
- [router.py:10-40](file://backend/api/v1/router.py#L10-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:65-96](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L65-L96)
- [20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql:1-31](file://supabase/migrations/20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql#L1-L31)
- [20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql:1-7](file://supabase/migrations/20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql#L1-L7)
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql:1-36](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql#L1-L36)

**Section sources**
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [types.ts:937-951](file://apps/web/src/integrations/supabase/types.ts#L937-L951)
- [router.py:10-40](file://backend/api/v1/router.py#L10-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:65-96](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L65-L96)
- [20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql:1-31](file://supabase/migrations/20260101211534_d1ce3159-d630-4859-8ee8-6361241b244c.sql#L1-L31)
- [20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql:1-7](file://supabase/migrations/20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql#L1-L7)
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql:1-36](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql#L1-L36)

## Core Components
- Users Manager UI: Fetches users, displays roles, supports role changes, and search/filtering.
- Admin Page: Hosts the Users tab within the admin dashboard.
- Auth Hook: Provides authentication state, session, profile, and role resolution.
- Supabase Types: Declares database tables, enums, views, and functions used by the UI.
- Backend API Router: Centralizes API authentication and routes.
- Artisan Admin: Django admin configuration for artisan records and certification actions.
- Supabase Policies: Define who can view and modify user roles and profiles.

Key responsibilities:
- User listing and filtering by name or ID
- Role assignment among buyer, artisan, admin
- Verification status display
- Role statistics and quick actions
- Integration with Supabase for auth and data
- Security via RLS and admin-only role management

**Section sources**
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [types.ts:937-951](file://apps/web/src/integrations/supabase/types.ts#L937-L951)
- [router.py:10-40](file://backend/api/v1/router.py#L10-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:65-96](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L65-L96)

## Architecture Overview
The Users Management system integrates the frontend admin UI with Supabase for authentication and data, and with backend services for artisan-related administration.

```mermaid
sequenceDiagram
participant AdminUI as "Admin UI<br/>UsersManager.tsx"
participant Auth as "Auth Hook<br/>useAuth.tsx"
participant Supabase as "Supabase Client<br/>client.ts"
participant DB as "Supabase DB"
AdminUI->>Supabase : "Fetch profiles"
AdminUI->>Supabase : "Fetch user roles"
Supabase-->>AdminUI : "Users with roles"
AdminUI->>Auth : "Read current user role"
Auth-->>AdminUI : "Role = admin?"
AdminUI->>Supabase : "Update role (delete + insert)"
Supabase-->>AdminUI : "Success/Failure"
AdminUI-->>AdminUI : "Refresh users list"
```

**Diagram sources**
- [UsersManager.tsx:45-123](file://apps/web/src/components/admin/UsersManager.tsx#L45-L123)
- [useAuth.tsx:56-66](file://apps/web/src/hooks/useAuth.tsx#L56-L66)
- [client.ts](file://apps/web/src/integrations/supabase/client.ts)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:82-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L82-L95)

**Section sources**
- [UsersManager.tsx:45-123](file://apps/web/src/components/admin/UsersManager.tsx#L45-L123)
- [useAuth.tsx:56-66](file://apps/web/src/hooks/useAuth.tsx#L56-L66)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:82-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L82-L95)

## Detailed Component Analysis

### Users Manager UI
Responsibilities:
- Load users from profiles and user_roles tables
- Render role badges and verification status
- Filter users by name or ID
- Trigger role change with confirmation dialog
- Display role statistics

Implementation highlights:
- Fetches profiles and roles separately, then merges into a single list
- Uses a confirmation dialog before applying role changes
- Provides a search box to filter users by name or ID
- Displays counts for each role type

```mermaid
flowchart TD
Start(["Load Users"]) --> FetchProfiles["Fetch profiles"]
FetchProfiles --> FetchRoles["Fetch user_roles"]
FetchRoles --> Merge["Merge into users list"]
Merge --> Render["Render table with roles and verification"]
Render --> Search["Apply search filter"]
Render --> ChangeRole["Open role change dialog"]
ChangeRole --> Confirm["Confirm role change"]
Confirm --> Update["Delete old role + Insert new role"]
Update --> Refresh["Reload users"]
Refresh --> End(["Done"])
```

**Diagram sources**
- [UsersManager.tsx:45-123](file://apps/web/src/components/admin/UsersManager.tsx#L45-L123)
- [UsersManager.tsx:125-128](file://apps/web/src/components/admin/UsersManager.tsx#L125-L128)
- [UsersManager.tsx:130-141](file://apps/web/src/components/admin/UsersManager.tsx#L130-L141)

**Section sources**
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)

### Admin Dashboard Integration
- The Admin page hosts a tabbed interface and mounts the Users Manager inside the “Users” tab.
- It enforces admin-only access by checking role and redirecting unauthorized users.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant AdminPage as "Admin.tsx"
participant Auth as "useAuth.tsx"
participant UsersTab as "UsersManager.tsx"
Browser->>AdminPage : "Navigate to /admin"
AdminPage->>Auth : "Check user and role"
Auth-->>AdminPage : "role = admin?"
AdminPage->>UsersTab : "Render Users tab"
UsersTab-->>Browser : "Display user management UI"
```

**Diagram sources**
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [useAuth.tsx:19-42](file://apps/web/src/hooks/useAuth.tsx#L19-L42)

**Section sources**
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [useAuth.tsx:19-42](file://apps/web/src/hooks/useAuth.tsx#L19-L42)

### Authentication and Authorization Hooks
- Resolves user session and profile from Supabase.
- Loads the user’s role from user_roles and exposes it to the UI.
- Provides sign-in, sign-out, and profile update utilities.

```mermaid
classDiagram
class AuthProvider {
+user
+session
+profile
+role
+loading
+signUp(email, password, fullName, role)
+signIn(email, password)
+signOut()
+updateProfile(updates)
}
class SupabaseClient {
+auth.onAuthStateChange()
+auth.getSession()
+from('profiles')
+from('user_roles')
}
AuthProvider --> SupabaseClient : "uses"
```

**Diagram sources**
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [client.ts](file://apps/web/src/integrations/supabase/client.ts)

**Section sources**
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)

### Supabase Schema and Types
- Declares the app_role enum with values admin, artisan, buyer.
- Defines tables for profiles and user_roles.
- Exposes helper functions like get_user_role and has_role.
- Declares a public_profiles view for safe public exposure.

```mermaid
erDiagram
PROFILES {
uuid user_id PK
string full_name
boolean is_verified
timestamp created_at
}
USER_ROLES {
uuid user_id PK
enum role
timestamp created_at
}
PROFILES ||--o{ USER_ROLES : "role assigned to"
```

**Diagram sources**
- [types.ts:684-731](file://apps/web/src/integrations/supabase/types.ts#L684-L731)
- [types.ts:860-880](file://apps/web/src/integrations/supabase/types.ts#L860-L880)
- [types.ts:937-946](file://apps/web/src/integrations/supabase/types.ts#L937-L946)
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql:21-33](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql#L21-L33)

**Section sources**
- [types.ts:684-731](file://apps/web/src/integrations/supabase/types.ts#L684-L731)
- [types.ts:860-880](file://apps/web/src/integrations/supabase/types.ts#L860-L880)
- [types.ts:937-946](file://apps/web/src/integrations/supabase/types.ts#L937-L946)
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql:21-33](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql#L21-L33)

### Backend API Router and Artisan Admin
- API router configures JWT authentication for protected endpoints.
- Artisan admin defines list display, filters, and actions for artisan records.
- Middleware fixes a compatibility issue with the admin theme.

```mermaid
graph LR
Router["API Router<br/>router.py"] --> Artisans["Artisan Endpoints"]
Router --> Products["Product Endpoints"]
Router --> Orders["Order Endpoints"]
Router --> Gifting["Gifting Endpoints"]
AdminUI["Admin UI"] --> |role updates| UserRoles["user_roles table"]
ArtisanAdmin["Artisan Admin<br/>admin.py"] --> ArtisanModel["Artisan Model<br/>models.py"]
ArtisanAdmin --> Middleware["Unfold Middleware<br/>middleware.py"]
```

**Diagram sources**
- [router.py:22-40](file://backend/api/v1/router.py#L22-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)

**Section sources**
- [router.py:22-40](file://backend/api/v1/router.py#L22-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)

### Role Assignment and Permission Controls
- Roles are stored in user_roles with app_role enum.
- Admins can view and manage all roles; regular users can only view their own.
- Role changes are applied by deleting the existing row and inserting the new role.

```mermaid
flowchart TD
A["Admin selects new role"] --> B["Open confirmation dialog"]
B --> C{"Confirm?"}
C --> |Yes| D["Delete existing user_roles row"]
D --> E["Insert new role row"]
E --> F["Notify success and refresh"]
C --> |No| G["Cancel"]
```

**Diagram sources**
- [UsersManager.tsx:89-123](file://apps/web/src/components/admin/UsersManager.tsx#L89-L123)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:87-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L87-L95)

**Section sources**
- [UsersManager.tsx:89-123](file://apps/web/src/components/admin/UsersManager.tsx#L89-L123)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:87-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L87-L95)

### Account Verification Workflow
- Verification status is stored in profiles.is_verified.
- Admins can toggle verification via the admin data hook.
- Verified counts are included in platform statistics.

```mermaid
sequenceDiagram
participant Admin as "Admin"
participant Hook as "useAdminData.tsx"
participant Supabase as "Supabase"
Admin->>Hook : "Call verifyArtisan(userId, verified)"
Hook->>Supabase : "UPDATE profiles SET is_verified = ? WHERE user_id = ?"
Supabase-->>Hook : "OK"
Hook-->>Admin : "Refresh artisans and stats"
```

**Diagram sources**
- [useAdminData.tsx:109-120](file://apps/web/src/hooks/useAdminData.tsx#L109-L120)
- [20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql:1-7](file://supabase/migrations/20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql#L1-L7)

**Section sources**
- [useAdminData.tsx:109-120](file://apps/web/src/hooks/useAdminData.tsx#L109-L120)
- [20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql:1-7](file://supabase/migrations/20260109095251_6889a1b9-3b1c-4b8f-9535-f3ef095414de.sql#L1-L7)

### User Search and Filtering
- Users can be filtered by name or ID using a simple text input.
- The filter checks full_name and user_id fields.

```mermaid
flowchart TD
Input["User enters search term"] --> Apply["Apply filter to users array"]
Apply --> NameMatch{"Name matches?"}
Apply --> IdMatch{"ID matches?"}
NameMatch --> |Yes| Show["Show user row"]
NameMatch --> |No| Hide["Hide user row"]
IdMatch --> |Yes| Show
IdMatch --> |No| Hide
```

**Diagram sources**
- [UsersManager.tsx:125-128](file://apps/web/src/components/admin/UsersManager.tsx#L125-L128)

**Section sources**
- [UsersManager.tsx:125-128](file://apps/web/src/components/admin/UsersManager.tsx#L125-L128)

### Bulk Actions and Audit Trail
- Role changes are performed individually with confirmation dialogs.
- There is no explicit audit log table referenced in the UI code; role updates are logged implicitly by Supabase RLS triggers and policies.

Recommendation:
- Introduce a dedicated audit_log table to track role changes with timestamps, actor, target, and changes for compliance and auditing.

**Section sources**
- [UsersManager.tsx:89-123](file://apps/web/src/components/admin/UsersManager.tsx#L89-L123)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:87-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L87-L95)

### User Activity Monitoring
- The platform includes a search_history table, indicating potential search activity tracking.
- No explicit user login/logout audit events are present in the UI code.

Recommendation:
- Add session and action logs for admin activities and consider integrating with the search_history table for broader activity insights.

**Section sources**
- [types.ts:836-859](file://apps/web/src/integrations/supabase/types.ts#L836-L859)

### Data Protection, Privacy, and Compliance
- Profiles table was adjusted to restrict direct access and expose a public_profiles view excluding sensitive fields.
- RLS policies limit profile visibility to self and admins.
- Role management is restricted to admins.

Recommendation:
- Enforce GDPR-style consent and data subject rights (access, rectification, erasure) via Supabase policies and backend handlers.
- Consider anonymizing or pseudonymizing identifiers in logs and analytics.

**Section sources**
- [20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql:1-36](file://supabase/migrations/20260121122109_0b1cb36d-aa4e-4dd7-a125-c453bc87fffe.sql#L1-L36)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:65-96](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L65-L96)

## Dependency Analysis
- The Users Manager depends on Supabase client and types for data access and typing.
- Auth hook resolves role and profile; Admin page guards access.
- Backend API router centralizes JWT authentication for API endpoints.
- Artisan admin depends on artisan models and middleware for UI rendering.

```mermaid
graph TB
UsersManager["UsersManager.tsx"] --> SupabaseTypes["types.ts"]
UsersManager --> SupabaseClient["client.ts"]
AdminPage["Admin.tsx"] --> UsersManager
AdminPage --> AuthHook["useAuth.tsx"]
AuthHook --> SupabaseClient
APIRouter["router.py"] --> ArtisanAdmin["admin.py"]
ArtisanAdmin --> ArtisanModel["models.py"]
ArtisanAdmin --> Middleware["middleware.py"]
```

**Diagram sources**
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [types.ts:937-951](file://apps/web/src/integrations/supabase/types.ts#L937-L951)
- [router.py:22-40](file://backend/api/v1/router.py#L22-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)

**Section sources**
- [UsersManager.tsx:33-292](file://apps/web/src/components/admin/UsersManager.tsx#L33-L292)
- [Admin.tsx:18-162](file://apps/web/src/pages/Admin.tsx#L18-L162)
- [useAuth.tsx:37-176](file://apps/web/src/hooks/useAuth.tsx#L37-L176)
- [types.ts:937-951](file://apps/web/src/integrations/supabase/types.ts#L937-L951)
- [router.py:22-40](file://backend/api/v1/router.py#L22-L40)
- [admin.py:10-92](file://backend/apps/artisans/admin.py#L10-L92)
- [models.py:62-170](file://backend/apps/artisans/models.py#L62-L170)
- [middleware.py:7-29](file://backend/apps/artisans/middleware.py#L7-L29)

## Performance Considerations
- Minimize round-trips by fetching profiles and roles in parallel and merging client-side.
- Use server-side filtering and pagination for large datasets.
- Cache frequently accessed role and profile data in memory to reduce repeated queries.

## Troubleshooting Guide
Common issues and resolutions:
- Role change fails silently: Verify Supabase connection and RLS policies for admin access.
- Users not appearing: Ensure profiles exist and user_roles entries are present.
- Auth state not resolving: Check Supabase auth state listener and session retrieval.

**Section sources**
- [UsersManager.tsx:77-82](file://apps/web/src/components/admin/UsersManager.tsx#L77-L82)
- [useAuth.tsx:68-101](file://apps/web/src/hooks/useAuth.tsx#L68-L101)
- [20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql:87-95](file://supabase/migrations/20251231095959_3473bebe-42ab-4109-8633-54732ebf1eaf.sql#L87-L95)

## Conclusion
The Users Management system provides a focused admin interface for role management, user verification, and basic analytics. It leverages Supabase for authentication and data with strong RLS policies to protect privacy. Enhancements such as a dedicated audit log, expanded activity monitoring, and stronger privacy controls would further improve compliance and operational insight.

## Appendices
- UI Patterns:
  - Role badges with icons for buyer, artisan, admin
  - Confirmation dialogs for destructive actions
  - Tabbed admin dashboard with role-based access
- Data Models:
  - profiles and user_roles tables with app_role enum
  - public_profiles view for safe public exposure