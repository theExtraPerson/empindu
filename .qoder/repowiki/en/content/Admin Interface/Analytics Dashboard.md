# Analytics Dashboard

<cite>
**Referenced Files in This Document**
- [AnalyticsDashboard.tsx](file://src/components/admin/AnalyticsDashboard.tsx)
- [usePlatformStats.tsx](file://src/hooks/usePlatformStats.tsx)
- [chart.tsx](file://src/components/ui/chart.tsx)
- [Admin.tsx](file://src/pages/Admin.tsx)
- [useAdminData.tsx](file://src/hooks/useAdminData.tsx)
- [client.ts](file://src/integrations/supabase/client.ts)
- [tailwind.config.ts](file://tailwind.config.ts)
- [use-mobile.tsx](file://src/hooks/use-mobile.tsx)
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
This document provides comprehensive documentation for the Analytics Dashboard component, focusing on real-time platform statistics display and data visualization. The dashboard presents key metrics including artisan counts, product availability, buyer metrics, and verification rates. It features animated card layouts, responsive design patterns, and interactive chart components built with Recharts. The documentation covers the PlatformStats interface, data fetching mechanisms, performance optimizations, color schemes, iconography, visual hierarchy, loading states, empty data handling, and accessibility considerations.

## Project Structure
The Analytics Dashboard is part of the admin interface and integrates with several supporting components and hooks:

```mermaid
graph TB
AdminPage["Admin Page<br/>(Admin.tsx)"] --> Dashboard["Analytics Dashboard<br/>(AnalyticsDashboard.tsx)"]
Dashboard --> StatsHook["Platform Stats Hook<br/>(usePlatformStats.tsx)"]
Dashboard --> ChartUI["Chart Utilities<br/>(chart.tsx)"]
StatsHook --> SupabaseClient["Supabase Client<br/>(client.ts)"]
Dashboard --> Icons["Lucide Icons<br/>(Users, Package, etc.)"]
Dashboard --> Motion["Framer Motion<br/>(Animations)"]
Dashboard --> Responsive["Responsive Design<br/>(Tailwind Grid)"]
```

**Diagram sources**
- [Admin.tsx:18-163](file://src/pages/Admin.tsx#L18-L163)
- [AnalyticsDashboard.tsx:1-226](file://src/components/admin/AnalyticsDashboard.tsx#L1-L226)
- [usePlatformStats.tsx:17-93](file://src/hooks/usePlatformStats.tsx#L17-L93)
- [chart.tsx:32-58](file://src/components/ui/chart.tsx#L32-L58)
- [client.ts:11-17](file://src/integrations/supabase/client.ts#L11-L17)

**Section sources**
- [Admin.tsx:18-163](file://src/pages/Admin.tsx#L18-L163)
- [AnalyticsDashboard.tsx:1-226](file://src/components/admin/AnalyticsDashboard.tsx#L1-L226)

## Core Components
The Analytics Dashboard consists of three primary components:

### PlatformStats Interface
The PlatformStats interface defines the data structure for analytics data:

```mermaid
classDiagram
class PlatformStats {
+number totalArtisans
+number verifiedArtisans
+number totalProducts
+number availableProducts
+number totalBuyers
+number totalOrders
+number totalSales
+CategoryCount[] productsByCategory
+StatusCount[] ordersByStatus
+TrendPoint[] recentOrderTrend
}
class CategoryCount {
+string category
+number count
}
class StatusCount {
+string status
+number count
}
class TrendPoint {
+string date
+number orders
+number sales
}
PlatformStats --> CategoryCount : "productsByCategory"
PlatformStats --> StatusCount : "ordersByStatus"
PlatformStats --> TrendPoint : "recentOrderTrend"
```

**Diagram sources**
- [usePlatformStats.tsx:4-15](file://src/hooks/usePlatformStats.tsx#L4-L15)

### Data Fetching Hook
The usePlatformStats hook manages data fetching and state management:

```mermaid
sequenceDiagram
participant Hook as "usePlatformStats"
participant Supabase as "Supabase Client"
participant Stats as "PlatformStats"
Hook->>Supabase : Query user_roles (artisan)
Supabase-->>Hook : Array of artisan IDs
Hook->>Supabase : Query public_profiles (verified)
Supabase-->>Hook : Verified artisan profiles
Hook->>Supabase : Query user_roles (buyer)
Supabase-->>Hook : Buyer IDs
Hook->>Supabase : Query products (category, availability)
Supabase-->>Hook : Product data
Hook->>Hook : Process category aggregation
Hook->>Stats : Set combined stats object
Stats-->>Hook : Ready for rendering
```

**Diagram sources**
- [usePlatformStats.tsx:21-86](file://src/hooks/usePlatformStats.tsx#L21-L86)

**Section sources**
- [usePlatformStats.tsx:4-15](file://src/hooks/usePlatformStats.tsx#L4-L15)
- [usePlatformStats.tsx:17-93](file://src/hooks/usePlatformStats.tsx#L17-L93)

## Architecture Overview
The Analytics Dashboard follows a unidirectional data flow pattern:

```mermaid
graph TB
subgraph "Presentation Layer"
Dashboard["AnalyticsDashboard.tsx"]
Cards["Stat Cards"]
Charts["Charts"]
end
subgraph "Data Layer"
Hook["usePlatformStats.tsx"]
Stats["PlatformStats"]
end
subgraph "Data Access"
Supabase["Supabase Client"]
DB["Database Tables"]
end
subgraph "UI Utilities"
ChartUI["chart.tsx"]
Icons["Lucide Icons"]
Motion["Framer Motion"]
Responsive["Tailwind CSS"]
end
Dashboard --> Cards
Dashboard --> Charts
Dashboard --> Hook
Hook --> Stats
Hook --> Supabase
Supabase --> DB
Dashboard --> ChartUI
Dashboard --> Icons
Dashboard --> Motion
Dashboard --> Responsive
```

**Diagram sources**
- [AnalyticsDashboard.tsx:1-226](file://src/components/admin/AnalyticsDashboard.tsx#L1-L226)
- [usePlatformStats.tsx:17-93](file://src/hooks/usePlatformStats.tsx#L17-L93)
- [chart.tsx:32-58](file://src/components/ui/chart.tsx#L32-L58)

## Detailed Component Analysis

### AnalyticsDashboard Component
The AnalyticsDashboard component renders the complete analytics interface with animated cards and interactive charts.

#### Animated Card Layouts
The dashboard uses Framer Motion for smooth entrance animations and hover effects:

```mermaid
flowchart TD
Start([Component Mount]) --> CheckStats{"Stats Available?"}
CheckStats --> |No| LoadingState["Show Loading Message"]
CheckStats --> |Yes| CreateCards["Generate Stat Cards"]
CreateCards --> AnimateCards["Animate Cards with Stagger"]
AnimateCards --> RenderCharts["Render Charts Section"]
RenderCharts --> GradientCard["Render Summary Card"]
GradientCard --> End([Complete])
LoadingState --> End
```

**Diagram sources**
- [AnalyticsDashboard.tsx:21-28](file://src/components/admin/AnalyticsDashboard.tsx#L21-L28)
- [AnalyticsDashboard.tsx:94-116](file://src/components/admin/AnalyticsDashboard.tsx#L94-L116)

#### Data Visualization Components
The dashboard implements two primary chart types:

**Bar Chart for Product Distribution by Category:**
- Uses Recharts BarChart component
- Horizontal orientation with rotated x-axis labels
- Responsive container for adaptive sizing
- Custom tooltip configuration

**Pie Chart for Category Breakdown:**
- Uses Recharts PieChart component
- Circular layout with inner and outer radii
- Custom cell coloring with dynamic color palette
- Percentage-based labels

#### Color Scheme and Visual Hierarchy
The dashboard employs a carefully curated color scheme:

```mermaid
graph LR
subgraph "Primary Palette"
Primary["Primary<br/>(hsl(var(--primary)))"]
Secondary["Secondary<br/>(hsl(var(--secondary)))"]
Accent["Accent<br/>(hsl(var(--accent)))"]
end
subgraph "Extended Palette"
Terracotta["Terracotta<br/>(hsl(24, 95%, 53%))"]
Green["Green<br/>(hsl(142, 76%, 36%))"]
Purple["Purple<br/>(hsl(280, 87%, 65%))"]
end
subgraph "Semantic Colors"
Success["Success<br/>(text-green-500)"]
Foreground["Foreground<br/>(text-primary)"]
Muted["Muted<br/>(text-muted-foreground)"]
end
```

**Diagram sources**
- [AnalyticsDashboard.tsx:12-19](file://src/components/admin/AnalyticsDashboard.tsx#L12-L19)
- [tailwind.config.ts:16-76](file://tailwind.config.ts#L16-L76)

#### Iconography System
The dashboard uses Lucide React icons for visual communication:

| Metric Type | Icon | Purpose |
|-------------|------|---------|
| Total Artisans | Users | Identifies artisan population |
| Verified Artisans | CheckCircle | Indicates verification status |
| Total Products | Package | Represents product inventory |
| Available Products | TrendingUp | Shows product availability |
| Total Buyers | ShoppingBag | Tracks customer base |
| Categories | Award | Denotes product categorization |

**Section sources**
- [AnalyticsDashboard.tsx:1-226](file://src/components/admin/AnalyticsDashboard.tsx#L1-L226)

### Chart Utilities and Configuration
The chart utilities provide reusable components for consistent chart behavior:

```mermaid
classDiagram
class ChartContainer {
+ChartConfig config
+ReactNode children
+forwardRef()
}
class ChartTooltip {
+RechartsPrimitive.Tooltip
}
class ChartTooltipContent {
+forwardRef()
+hideLabel : boolean
+hideIndicator : boolean
+indicator : "line"|"dot"|"dashed"
}
class ChartStyle {
+THEMES : Record
+colorConfig : Array
}
ChartContainer --> ChartStyle : "applies"
ChartContainer --> ChartTooltip : "contains"
ChartTooltip --> ChartTooltipContent : "renders"
```

**Diagram sources**
- [chart.tsx:32-58](file://src/components/ui/chart.tsx#L32-L58)
- [chart.tsx:90-226](file://src/components/ui/chart.tsx#L90-L226)

**Section sources**
- [chart.tsx:1-304](file://src/components/ui/chart.tsx#L1-L304)

### Data Fetching Mechanisms
The usePlatformStats hook implements efficient data fetching with proper error handling:

```mermaid
sequenceDiagram
participant Component as "AnalyticsDashboard"
participant Hook as "usePlatformStats"
participant Supabase as "Supabase Client"
participant State as "Stats State"
Component->>Hook : Initialize with empty stats
Hook->>Supabase : fetchStats()
Supabase-->>Hook : artisanRoles data
Hook->>Supabase : verifiedProfiles query
Supabase-->>Hook : verifiedProfiles data
Hook->>Supabase : buyerRoles query
Supabase-->>Hook : buyerRoles data
Hook->>Supabase : products query
Supabase-->>Hook : products data
Hook->>Hook : Process category aggregation
Hook->>State : setStats(combinedData)
State-->>Component : stats ready for rendering
```

**Diagram sources**
- [usePlatformStats.tsx:17-93](file://src/hooks/usePlatformStats.tsx#L17-L93)

**Section sources**
- [usePlatformStats.tsx:17-93](file://src/hooks/usePlatformStats.tsx#L17-L93)

## Dependency Analysis
The Analytics Dashboard has the following key dependencies:

```mermaid
graph TB
subgraph "External Dependencies"
Recharts["Recharts Library"]
FramerMotion["Framer Motion"]
Lucide["Lucide Icons"]
TailwindCSS["Tailwind CSS"]
end
subgraph "Internal Dependencies"
AdminPage["Admin Page"]
ChartUtils["Chart Utilities"]
SupabaseClient["Supabase Client"]
PlatformStats["PlatformStats Interface"]
end
AnalyticsDashboard --> Recharts
AnalyticsDashboard --> FramerMotion
AnalyticsDashboard --> Lucide
AnalyticsDashboard --> TailwindCSS
AnalyticsDashboard --> AdminPage
AnalyticsDashboard --> ChartUtils
AnalyticsDashboard --> SupabaseClient
AnalyticsDashboard --> PlatformStats
```

**Diagram sources**
- [AnalyticsDashboard.tsx:1-6](file://src/components/admin/AnalyticsDashboard.tsx#L1-L6)
- [Admin.tsx:11-29](file://src/pages/Admin.tsx#L11-L29)

**Section sources**
- [AnalyticsDashboard.tsx:1-6](file://src/components/admin/AnalyticsDashboard.tsx#L1-L6)
- [Admin.tsx:11-29](file://src/pages/Admin.tsx#L11-L29)

## Performance Considerations
The Analytics Dashboard implements several performance optimizations:

### Data Fetching Optimizations
- Single data source for all metrics reduces network requests
- Efficient category aggregation using Map data structure
- Lazy loading for chart components
- Memoized calculations for derived metrics

### Rendering Optimizations
- Framer Motion animations only trigger on mount
- Responsive charts adapt to container size
- Conditional rendering prevents unnecessary DOM nodes
- CSS transitions for hover effects

### Memory Management
- Proper cleanup of event listeners
- Efficient state updates
- Minimal re-renders through selective updates

## Troubleshooting Guide

### Common Issues and Solutions

#### Loading State Problems
**Issue**: Dashboard shows loading indefinitely
**Solution**: Verify Supabase connection and check network tab for failed requests

#### Empty Data Display
**Issue**: Charts show "No data available" message
**Solution**: Confirm database tables have data and Supabase permissions are configured correctly

#### Chart Rendering Issues
**Issue**: Charts not displaying properly on small screens
**Solution**: Ensure ResponsiveContainer is properly sized and Tailwind breakpoints are configured

#### Animation Performance
**Issue**: Staggered animations causing performance issues
**Solution**: Adjust animation delays or disable animations on lower-powered devices

**Section sources**
- [AnalyticsDashboard.tsx:22-28](file://src/components/admin/AnalyticsDashboard.tsx#L22-L28)
- [AnalyticsDashboard.tsx:144-148](file://src/components/admin/AnalyticsDashboard.tsx#L144-L148)
- [AnalyticsDashboard.tsx:184-187](file://src/components/admin/AnalyticsDashboard.tsx#L184-L187)

## Conclusion
The Analytics Dashboard provides a comprehensive solution for displaying real-time platform statistics with modern UI/UX principles. The component architecture ensures maintainability while delivering excellent user experience through animations, responsive design, and interactive data visualization. The implementation demonstrates best practices in data fetching, state management, and performance optimization while maintaining accessibility and visual consistency across different device sizes.

The dashboard successfully combines functional requirements with aesthetic design, providing administrators with actionable insights into platform health and performance metrics through intuitive visual representations and smooth user interactions.