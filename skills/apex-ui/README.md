---
name: apex-ui
description: Apex GEO/AEO Platform UI/UX design system enforcement. Ensures all UI components follow the authoritative design system with correct colors, card hierarchy, typography, page layout patterns, and sub-page navigation. USE WHEN creating or modifying any Apex UI component or page.
---

# Apex UI Design System Skill

## When to Activate This Skill
- Creating new UI components for Apex
- Modifying existing Apex components
- Creating new dashboard pages or sub-pages
- Styling any modal, card, or container
- Working with colors, backgrounds, or borders
- Adding AI platform-specific styling
- Questions about Apex design patterns
- Adding page headers or navigation

## Source of Truth

**AUTHORITATIVE DOCUMENT**: `docs/APEX_DESIGN_SYSTEM.md` (Version 4.1)

ALWAYS reference this document. All other UI docs have been archived.

---

## Page Layout Patterns

### Main Pages (Top-Level Dashboard Routes)

All main pages use a unified structure with APEX header and decorative star:

```tsx
<div className="space-y-6 relative">
  <PageHeader />        {/* APEX logo + module name + AI status */}
  {/* Main Content */}
  <DecorativeStar />    {/* Positioned absolute bottom-8 right-8 */}
</div>
```

**Key Requirements:**
- Wrapper: `space-y-6 relative`
- PageHeader with unique gradient ID (e.g., `apexGradMonitor`)
- DecorativeStar with unique gradient ID (e.g., `starGradientMonitor`)
- No secondary navigation tabs

### Sub-Pages (Nested Routes)

Sub-pages use a simpler pattern with back link:

```tsx
<div className="space-y-6">
  <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <ArrowLeft className="w-4 h-4" />
    Back to Parent
  </Link>
  <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
  {/* Main Content */}
</div>
```

**Key Differences:**
- No `relative` on wrapper (no DecorativeStar)
- No PageHeader - use back link instead
- No AI status indicator

---

## Quick Reference (DESIGN Object)

```typescript
const DESIGN = {
  // Backgrounds (dark to light)
  bgDeep: "#0a0f1a",        // Page background
  bgBase: "#0d1224",        // Main content area
  bgElevated: "#111827",    // Elevated surfaces
  bgCard: "#141930",        // Card backgrounds
  bgCardHover: "#1a2040",   // Card hover state
  bgInput: "#101828",       // Input fields

  // Primary Brand
  primaryCyan: "#00E5CC",   // Main accent, CTAs, metrics
  cyanBright: "#00FFE0",    // Hover/emphasis
  cyanMuted: "#00B8A3",     // Subdued state

  // Secondary Accents
  accentPurple: "#8B5CF6",  // Secondary accent, gradients
  purpleLight: "#A78BFA",   // Light purple variant
  accentPink: "#EC4899",    // Tertiary accent
  accentBlue: "#3B82F6",    // Info states, links

  // Semantic
  success: "#22C55E",       // Positive states
  warning: "#F59E0B",       // Warning states
  error: "#EF4444",         // Error states
  info: "#3B82F6",          // Informational

  // Text
  textPrimary: "#FFFFFF",   // Main headings
  textSecondary: "#94A3B8", // Body text (slate-400)
  textMuted: "#64748B",     // Disabled (slate-500)
  textAccent: "#00E5CC",    // Links, highlights

  // Borders (ALWAYS use rgba)
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  borderDefault: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  borderAccent: "rgba(0, 229, 204, 0.3)",
  borderGlow: "rgba(0, 229, 204, 0.5)",
};
```

---

## 3-Tier Card Hierarchy

### Tier 1: Primary Cards (`.card-primary`)
**Use for:** Main KPIs, GEO Score, hero metrics

### Tier 2: Secondary Cards (`.card-secondary`)
**Use for:** Charts, recommendations, data tables

### Tier 3: Tertiary Cards (`.card-tertiary`)
**Use for:** List items, activity rows, compact stats

```tsx
// CORRECT
<div className="card-primary">
  <GEOScoreGauge score={72} />
</div>

// WRONG - Don't use basic Card
<Card className="border-primary/20">
  <GEOScoreGauge score={72} />
</Card>
```

---

## AI Platform Colors

| Platform | Hex |
|----------|-----|
| ChatGPT | `#10A37F` |
| Claude | `#D97757` |
| Gemini | `#4285F4` |
| Perplexity | `#20B8CD` |
| Grok | `#FFFFFF` |
| DeepSeek | `#6366F1` |

---

## Glassmorphism (Modals Only)

**DO NOT** use on main content cards. Only for:
- Modal dialogs
- Tooltips/popovers
- Floating overlays

```tsx
<div
  className="rounded-2xl backdrop-blur-xl"
  style={{
    backgroundColor: `${DESIGN.bgCard}B3`, // 70% opacity
    border: `1px solid ${DESIGN.primaryCyan}33`,
    boxShadow: `0 0 40px ${DESIGN.primaryCyan}15`,
  }}
>
```

---

## Anti-Patterns

| DO NOT | DO INSTEAD |
|--------|------------|
| Use `#000000` background | Use `#0a0f1a` (bgDeep) |
| Use hex for borders | Use rgba values |
| Glassmorphism on main cards | Reserve for modals only |
| More than 3-4 colors per view | Stick to primary + 1-2 accents |
| Basic `<Card>` component | Use `.card-primary/.secondary/.tertiary` |
| `dashboard-bg min-h-screen` wrapper | Use `space-y-6 relative` |
| Secondary nav tabs in pages | Use main sidebar for navigation |
| Generic SVG gradient IDs | Use page-specific IDs (e.g., `apexGradMonitor`) |

---

## Implementation Files

- **CSS Variables**: `src/app/globals.css`
- **Documentation**: `docs/APEX_DESIGN_SYSTEM.md`
- **Reference Image**: `docs/images UI/Dash idea.png`
