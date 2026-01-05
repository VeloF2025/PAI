---
name: apex-ui-ux
description: |
  Apex GEO/AEO Platform UI/UX design system and component patterns.
  Reference for implementing consistent, beautiful interfaces following
  the established design language.

  USE WHEN user says 'UI design', 'design system', 'component styling',
  'modal design', 'glassmorphism', 'card hierarchy', 'Apex styling',
  'page layout', 'how should this look', 'make it match the design'
---

# Apex UI/UX Design System

## Source of Truth

**AUTHORITATIVE DOCUMENT**: `docs/APEX_DESIGN_SYSTEM.md` (Version 4.1)

All other UI docs have been archived to `docs/archive/`.

---

## Core Design Philosophy

- **Dark-first:** Deep space navy backgrounds (`#0a0f1a`), NOT pure black
- **Subtle luxury:** Glassmorphism for overlays only, not main content
- **Data-dense:** Clean information hierarchy, professional typography
- **Accent restraint:** Cyan primary, purple secondary, no rainbow UI
- **Unified layout:** Consistent page structure across all modules

---

## Page Layout Patterns

### Main Pages (Top-Level Routes)

All main dashboard pages use this unified structure:

```tsx
<div className="space-y-6 relative">
  {/* 1. PageHeader with APEX branding + AI status */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <ApexLogo id="apexGradMonitor" />
      <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        APEX
      </span>
      <span className="text-xl font-light text-foreground ml-1">Monitor</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs text-muted-foreground">AI Status:</span>
      <span className="text-xs text-primary font-medium">Active</span>
    </div>
  </div>

  {/* 2. Main Content */}
  {/* ... */}

  {/* 3. DecorativeStar */}
  <DecorativeStar id="starGradientMonitor" />
</div>
```

**IMPORTANT:** Each page needs unique gradient IDs to avoid SVG conflicts.

### Sub-Pages (Nested Routes)

Sub-pages use a simpler pattern with back link:

```tsx
<div className="space-y-6">
  <Link href="/dashboard/monitor" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <ArrowLeft className="w-4 h-4" />
    Back to Monitor
  </Link>
  <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
  {/* Main Content */}
</div>
```

**Key Differences:**
- No `relative` on wrapper
- No PageHeader or DecorativeStar
- Uses back link for navigation

---

## Quick Reference (DESIGN Object)

```typescript
const DESIGN = {
  // Backgrounds (dark to light)
  bgDeep: "#0a0f1a",
  bgBase: "#0d1224",
  bgElevated: "#111827",
  bgCard: "#141930",
  bgCardHover: "#1a2040",
  bgInput: "#101828",

  // Primary Brand
  primaryCyan: "#00E5CC",
  cyanBright: "#00FFE0",
  cyanMuted: "#00B8A3",

  // Secondary Accents
  accentPurple: "#8B5CF6",
  purpleLight: "#A78BFA",
  accentPink: "#EC4899",
  accentBlue: "#3B82F6",

  // Semantic
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textAccent: "#00E5CC",

  // Borders (ALWAYS use rgba)
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  borderDefault: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  borderAccent: "rgba(0, 229, 204, 0.3)",
  borderGlow: "rgba(0, 229, 204, 0.5)",
};
```

---

## Workflows

### 1. card-hierarchy.md
**Purpose:** 3-tier card system for content organization
**Trigger:** Creating cards, panels, or content containers
**Pattern:** `.card-primary` / `.card-secondary` / `.card-tertiary`

### 2. glassmorphism-modals.md
**Purpose:** Modal/overlay styling with frosted glass effect
**Trigger:** Modal, dialog, overlay, or popup styling
**Pattern:** 50-70% opacity background + backdrop blur + glow shadow

### 3. page-layout.md
**Purpose:** Unified page structure for main and sub-pages
**Trigger:** Creating new pages, adding headers, navigation
**Pattern:** Main pages (PageHeader + DecorativeStar) vs Sub-pages (back link)

---

## Card Hierarchy

| Tier | Class | Use For |
|------|-------|---------|
| Primary | `.card-primary` | Main KPIs, GEO Score, hero metrics |
| Secondary | `.card-secondary` | Charts, recommendations, tables |
| Tertiary | `.card-tertiary` | List items, activity rows, compact stats |

```tsx
// CORRECT
<div className="card-primary">
  <GEOScoreGauge score={72} />
</div>

// WRONG
<Card className="border-primary/20">...</Card>
```

---

## Glassmorphism Modal Pattern

```tsx
<div
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  style={{ backgroundColor: "rgba(10, 15, 26, 0.8)" }}
>
  <div
    className="rounded-2xl backdrop-blur-xl max-w-3xl w-full"
    style={{
      backgroundColor: `${DESIGN.bgCard}B3`,
      border: `1px solid ${DESIGN.primaryCyan}33`,
      boxShadow: `0 0 40px ${DESIGN.primaryCyan}15`,
    }}
  >
    {/* Content */}
  </div>
</div>
```

---

## Animation Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150ms | ease-in-out |
| Modal transitions | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Gauge animations | 800ms | cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## Anti-Patterns

- Pure black `#000000` backgrounds
- More than 3-4 accent colors per view
- Glassmorphism on main content cards
- Bouncy/elastic animations
- Basic `<Card>` without hierarchy class
- `dashboard-bg min-h-screen` wrapper
- Secondary navigation tabs in pages
- Generic SVG gradient IDs (use page-specific)

---

## Reference Files

- **Implementation**: `src/app/globals.css`
- **Documentation**: `docs/APEX_DESIGN_SYSTEM.md`
- **Reference Image**: `docs/images UI/Dash idea.png`

---

**Always check `docs/APEX_DESIGN_SYSTEM.md` before implementing any UI component!**
