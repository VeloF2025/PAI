# Glassmorphism Modal Pattern

**Trigger:** Modal design, overlay styling, dialog, popup, frosted glass effect
**Source:** `docs/APEX_DESIGN_SYSTEM.md` (authoritative)

## Overview

Apex modals use a frosted glass (glassmorphism) effect with:
- **50% opacity** semi-transparent background
- **Backdrop blur** for the frosted effect
- **Glow shadow** matching the modal's purpose (cyan for standard, red for destructive)

## Implementation Pattern

### Standard Modal (Cyan Glow)
```tsx
{/* Backdrop */}
<div
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  style={{ backgroundColor: "rgba(2, 3, 10, 0.8)" }}
  onClick={onClose}
>
  {/* Modal Container */}
  <div
    className="relative max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl backdrop-blur-xl"
    style={{
      backgroundColor: `${DESIGN.bgCard}80`, // 50% opacity (#0F122580)
      border: `1px solid ${DESIGN.primaryCyan}33`, // Cyan border at 20% opacity
      boxShadow: `0 0 40px ${DESIGN.primaryCyan}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Content */}
  </div>
</div>
```

### Destructive Modal (Red Glow)
```tsx
<div
  className="relative max-w-md w-full rounded-2xl overflow-hidden backdrop-blur-xl"
  style={{
    backgroundColor: `${DESIGN.bgCard}80`, // 50% opacity
    border: `1px solid ${DESIGN.errorRed}33`, // Red border for destructive
    boxShadow: `0 0 40px ${DESIGN.errorRed}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
  }}
>
  {/* Delete confirmation content */}
</div>
```

## Opacity Reference

| Hex Suffix | Opacity | Use Case |
|------------|---------|----------|
| `FF` | 100% | Solid backgrounds |
| `CC` | 80% | Slightly translucent |
| `B3` | 70% | More opaque alternative |
| `99` | 60% | More translucent |
| `80` | 50% | **Modal default** |
| `33` | 20% | Borders, subtle accents |
| `15` | ~8% | Glow shadows |

## Complete Modal Structure

```tsx
// Full modal with header, scrollable body, and footer
<div
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  style={{ backgroundColor: "rgba(2, 3, 10, 0.8)" }}
>
  <div
    className="relative max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl backdrop-blur-xl"
    style={{
      backgroundColor: `${DESIGN.bgCard}B3`,
      border: `1px solid ${DESIGN.primaryCyan}33`,
      boxShadow: `0 0 40px ${DESIGN.primaryCyan}15, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
    }}
  >
    {/* Header - Fixed */}
    <div
      className="flex items-center justify-between p-6 border-b"
      style={{ borderColor: DESIGN.borderDefault }}
    >
      <div className="flex items-center gap-4">
        <img src={logoUrl} className="w-12 h-12 rounded-xl" />
        <div>
          <h2 className="text-xl font-semibold" style={{ color: DESIGN.textPrimary }}>
            Modal Title
          </h2>
          <p style={{ color: DESIGN.textSecondary }}>Subtitle text</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>

    {/* Scrollable Body */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Content sections */}
    </div>

    {/* Footer - Fixed (optional) */}
    <div
      className="flex justify-end gap-3 p-6 border-t"
      style={{ borderColor: DESIGN.borderDefault }}
    >
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit}>Confirm</Button>
    </div>
  </div>
</div>
```

## Key CSS Classes

- `backdrop-blur-xl` - Applies the frosted glass blur effect
- `rounded-2xl` - Consistent modal border radius
- `max-h-[90vh]` - Prevent modal from exceeding viewport
- `overflow-hidden flex flex-col` - Enable scrollable body with fixed header/footer

## Files Using This Pattern

- `src/components/brands/brand-detail-view.tsx` - Brand Detail View modal
- `src/app/dashboard/brands/page.tsx` - Edit Brand modal, Delete Confirmation modal
- `src/components/brands/scrape-wizard.tsx` - Scrape Wizard modal

## When to Use

- All modal dialogs and overlays
- Full-screen drawers
- Floating panels that overlay content
- Confirmation dialogs

## When NOT to Use

- Main page content cards (use card hierarchy instead)
- Sidebar navigation
- Inline content sections
- Tooltips (use `.glass-tooltip` class)
