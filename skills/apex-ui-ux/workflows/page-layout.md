# Page Layout Workflow

## Purpose
Implement consistent page structure across all Apex dashboard pages.

## When to Use
- Creating a new dashboard page
- Adding page headers
- Setting up navigation
- Implementing sub-pages

---

## Main Page Pattern

All top-level dashboard routes (`/dashboard/*`) use this pattern:

### 1. Page Structure

```tsx
export default function ModulePage() {
  return (
    <div className="space-y-6 relative">
      {/* APEX Header */}
      <PageHeader />

      {/* Main Content */}
      {/* Your page content here */}

      {/* Decorative Star */}
      <DecorativeStar />
    </div>
  );
}
```

### 2. PageHeader Component

**IMPORTANT**: Use a unique gradient ID for each page (e.g., `apexGradMonitor`).

```tsx
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L28 28H4L16 4Z" fill="url(#apexGradMonitor)" />
            <defs>
              <linearGradient id="apexGradMonitor" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E5CC"/>
                <stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          APEX
        </span>
        <span className="text-xl font-light text-foreground ml-1">Monitor</span>
      </div>

      {/* AI Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">AI Status:</span>
        <span className="text-xs text-primary font-medium">Active</span>
      </div>
    </div>
  );
}
```

### 3. DecorativeStar Component

**IMPORTANT**: Use a unique gradient ID (e.g., `starGradientMonitor`).

```tsx
function DecorativeStar() {
  return (
    <div className="absolute bottom-8 right-8 w-12 h-12 opacity-60 pointer-events-none">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 0L26.5 21.5L48 24L26.5 26.5L24 48L21.5 26.5L0 24L21.5 21.5L24 0Z"
          fill="url(#starGradientMonitor)"
        />
        <defs>
          <linearGradient id="starGradientMonitor" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00E5CC" stopOpacity="0.6"/>
            <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.3"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
```

---

## Sub-Page Pattern

Nested routes (e.g., `/dashboard/monitor/mentions`) use a simpler pattern:

```tsx
export default function MentionsSubPage() {
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/monitor"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Monitor
      </Link>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-foreground">Mentions</h1>

      {/* Main Content */}
      {/* Your sub-page content here */}
    </div>
  );
}
```

**Key Differences from Main Pages:**
- No `relative` on wrapper
- No PageHeader component
- No DecorativeStar
- Uses back link for navigation

---

## Gradient ID Naming Convention

| Page | Logo ID | Star ID |
|------|---------|---------|
| Dashboard | `apexGradDashboard` | `starGradientDashboard` |
| Monitor | `apexGradMonitor` | `starGradientMonitor` |
| Audit | `apexGradAudit` | `starGradientAudit` |
| Create | `apexGradCreate` | `starGradientCreate` |
| Feedback | `apexGradFeedback` | `starGradientFeedback` |
| Engines | `apexGradEngine` | `starGradientEngine` |
| Settings | `apexGradSettings` | `starGradientSettings` |
| Reports | `apexGradReports` | `starGradientReports` |
| Brands | `apexGradBrands` | `starGradientBrands` |
| Portfolios | `apexGradPortfolios` | `starGradientPortfolios` |
| Competitive | `apexGradCompetitive` | `starGradientCompetitive` |
| Social | `apexGradSocial` | `starGradientSocial` |
| People | `apexGradPeople` | `starGradientPeople` |
| Recommendations | `apexGradRecommendations` | `starGradientRecommendations` |

---

## Common Mistakes to Avoid

1. **Using `dashboard-bg min-h-screen`** - Use `space-y-6 relative` instead
2. **Adding secondary navigation tabs** - Navigation is via main sidebar only
3. **Using generic gradient IDs** - Each page needs unique IDs
4. **Adding PageHeader to sub-pages** - Use back link pattern instead
5. **Forgetting `relative` on main page wrapper** - Required for DecorativeStar positioning
6. **Forgetting `pointer-events-none` on star** - Prevents interaction blocking

---

## Module Names

| Route | Module Name in Header |
|-------|----------------------|
| `/dashboard` | Orbit |
| `/dashboard/monitor` | Monitor |
| `/dashboard/audit` | Audit |
| `/dashboard/create` | Create |
| `/dashboard/feedback` | Feedback |
| `/dashboard/engine-room` | Engines |
| `/dashboard/settings` | Settings |
| `/dashboard/reports` | Reports |
| `/dashboard/brands` | Brands |
| `/dashboard/portfolios` | Portfolios |
| `/dashboard/competitive` | Competitive |
| `/dashboard/social` | Social |
| `/dashboard/people` | People |
| `/dashboard/recommendations` | Recommendations |
