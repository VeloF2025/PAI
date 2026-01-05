# Generate Component Workflow

## Purpose
Generate new React/TSX components that match the existing BOSS Exchange design patterns.

**When to use**: User needs a new button, card, modal, form, or other UI component.

## Prerequisites

1. **Captured data exists** in `captured/` directory
   - If not, run `capture-and-learn.md` workflow first

2. **CLAUDE.md is up to date** with learned patterns
   - Check timestamp matches recent capture

## Workflow Steps

### Step 1: Check Captured Data Exists

```bash
ls ~/.claude/skills/boss-ui-ux/captured/
```

Required files:
- `colors-extracted.json`
- `components-catalog.json`
- `typography.json`
- `spacing.json`

If missing, run capture-and-learn workflow first.

### Step 2: Identify Component Type

Determine what kind of component is needed:
- **Card**: Data display, stats, content container
- **Button**: Action trigger (primary, secondary, success, danger)
- **Badge**: Status label, tag, count indicator
- **Modal**: Dialog, form overlay, confirmation
- **Form**: Input fields, validation, submission
- **Status**: Connection indicator, health status

### Step 3: Read Captured Patterns

Load the relevant pattern from `captured/components-catalog.json`:

```python
import json
with open('captured/components-catalog.json') as f:
    catalog = json.load(f)

# Get card pattern
card_pattern = catalog['components']['cards']['samples'][0]
print(card_pattern['className'])
print(card_pattern['styles'])
```

### Step 4: Read Color Tokens

Load the actual colors from `captured/colors-extracted.json`:

```python
with open('captured/colors-extracted.json') as f:
    colors = json.load(f)

# Get most common background colors
for bg in colors['backgrounds'][:5]:
    print(f"{bg['hex']} - used {bg['count']} times")
```

### Step 5: Generate Component Code

Based on captured patterns, generate the component:

**For a Card component**:
```tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, icon: Icon, children, className = '' }: CardProps) {
  return (
    <motion.div
      className={`card ${className}`}  // Uses actual .card class from app
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {Icon && (
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-blue/10">
            <Icon size={20} className="text-neon-blue" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}
```

### Step 6: Validate Output

Run validation to ensure generated code matches captured patterns:

```bash
python scripts/compare_to_captured.py --file path/to/NewComponent.tsx
```

### Step 7: Output Format

Provide the user with:

1. **Complete TSX code** - Ready to use
2. **Props interface** - TypeScript types
3. **Usage example** - How to import and use
4. **Pattern source** - Which captured pattern it's based on

## Component Templates

### Button (Primary)
```tsx
<button className="btn-primary">
  {Icon && <Icon size={16} />}
  {label}
</button>
```

### Button (Secondary)
```tsx
<button className="btn-secondary">
  {label}
</button>
```

### Badge
```tsx
<span className="badge-primary">
  {text}
</span>
```

### Input
```tsx
<input
  type="text"
  className="input"
  placeholder={placeholder}
/>
```

### Status Indicator
```tsx
<div className="flex items-center gap-2">
  <span className="status-connected" />
  <span className="text-sm text-gray-400">Connected</span>
</div>
```

## Validation Checklist

Before delivering generated component:

- [ ] Uses classes from captured patterns (not invented)
- [ ] Colors match extracted values
- [ ] Spacing follows captured patterns
- [ ] Has TypeScript types
- [ ] Has Framer Motion if animated
- [ ] Has accessibility attributes (aria-*, role)
- [ ] Tested against validation script

## Common Patterns from BOSS

Read CLAUDE.md for full details, but common patterns include:

- **Backgrounds**: `bg-space-secondary`, `bg-space-tertiary`
- **Borders**: `border border-space-border`
- **Text**: `text-gray-100`, `text-gray-400`, `text-neon-blue`
- **Animations**: `transition-all duration-200`, `hover:scale-[1.02]`
- **Rounding**: `rounded-lg`, `rounded-xl`
