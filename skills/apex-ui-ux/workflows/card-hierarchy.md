# Card Hierarchy Pattern

**Trigger:** Card design, content containers, panels, data display
**Source:** `docs/APEX_DESIGN_SYSTEM.md` (authoritative)

## Overview

Apex uses a 3-tier card hierarchy system defined in `globals.css`:
1. **Primary** - Main metrics, hero content
2. **Secondary** - Charts, recommendations, tables
3. **Tertiary** - List items, compact content

## Implementation

### Primary Cards (`.card-primary`)
For main metrics like AI Visibility Pulse, Trust Score, key KPIs.

```tsx
<div className="card-primary">
  <GEOScoreGauge score={72} />
  <h3>AI Visibility Score</h3>
</div>
```

**Styling:**
- Subtle cyan border with soft glow shadow
- Higher visual prominence
- Use sparingly (1-3 per view)

### Secondary Cards (`.card-secondary`)
For recommendations, charts, data tables.

```tsx
<div className="card-secondary">
  <h4>Recommendations</h4>
  <RecommendationList items={recommendations} />
</div>
```

**Styling:**
- 1px muted border with subtle shadow
- Standard content containers
- Most common card type

### Tertiary Cards (`.card-tertiary`)
For list items, activity items, compact stat cards.

```tsx
<div className="card-tertiary">
  <ActivityItem timestamp="2h ago" action="Page indexed" />
</div>
```

**Styling:**
- Transparent background with minimal border
- Low visual weight
- Good for repeated items in lists

## CSS Definitions (globals.css)

```css
.card-primary {
  @apply rounded-xl p-6;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--primary) / 0.2);
  box-shadow: 0 0 20px hsl(var(--primary) / 0.1);
}

.card-secondary {
  @apply rounded-xl p-6;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-tertiary {
  @apply rounded-lg p-4;
  background: transparent;
  border: 1px solid hsl(var(--border) / 0.5);
}
```

## Inline Style Alternative

When CSS classes aren't available, use inline styles:

```tsx
// Primary card inline
<div
  className="rounded-xl p-6"
  style={{
    backgroundColor: DESIGN.bgCard,
    border: `1px solid ${DESIGN.primaryCyan}33`,
    boxShadow: `0 0 20px ${DESIGN.primaryCyan}15`,
  }}
>

// Secondary card inline
<div
  className="rounded-xl p-6"
  style={{
    backgroundColor: DESIGN.bgCard,
    border: `1px solid ${DESIGN.borderDefault}`,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  }}
>

// Tertiary card inline
<div
  className="rounded-lg p-4"
  style={{
    backgroundColor: "transparent",
    border: `1px solid ${DESIGN.borderSubtle}`,
  }}
>
```

## Dashboard Layout Example

```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Hero metric - Primary card */}
  <div className="col-span-4">
    <div className="card-primary">
      <AIVisibilityGauge score={72} />
    </div>
  </div>

  {/* Secondary metrics */}
  <div className="col-span-8 grid grid-cols-3 gap-4">
    <div className="card-secondary">
      <MetricCard label="Trust Score" value={85} />
    </div>
    <div className="card-secondary">
      <MetricCard label="Coverage" value={67} />
    </div>
    <div className="card-secondary">
      <MetricCard label="Mentions" value={142} />
    </div>
  </div>

  {/* Recommendations - Secondary card */}
  <div className="col-span-8">
    <div className="card-secondary">
      <h3>Smart Recommendations</h3>
      {recommendations.map(rec => (
        <div key={rec.id} className="card-tertiary">
          <RecommendationItem {...rec} />
        </div>
      ))}
    </div>
  </div>

  {/* Activity feed - Tertiary items */}
  <div className="col-span-4">
    <div className="card-secondary">
      <h3>Recent Activity</h3>
      {activities.map(activity => (
        <div key={activity.id} className="card-tertiary">
          <ActivityItem {...activity} />
        </div>
      ))}
    </div>
  </div>
</div>
```

## Anti-Patterns

```tsx
// ❌ WRONG - Basic Card without hierarchy
<Card className="border-primary/20">
  <GEOScoreGauge score={72} />
</Card>

// ✅ CORRECT - Using design system classes
<div className="card-primary">
  <GEOScoreGauge score={72} />
</div>
```

## When to Use Each Level

| Card Type | Use For | Examples |
|-----------|---------|----------|
| Primary | Hero metrics, main KPIs | AI Visibility gauge, Trust Score |
| Secondary | Content containers, data | Charts, tables, recommendation lists |
| Tertiary | Repeated items, compact | List items, activity rows, tags |
