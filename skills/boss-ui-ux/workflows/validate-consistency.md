# Validate UI Consistency Workflow

## Purpose
Check that UI components match the captured design patterns from the live BOSS application.

**When to use**: Before PR submission, during code review, or when UI looks inconsistent.

## Prerequisites

1. **Captured data exists** with recent timestamp
2. **Target files identified** for validation

## Workflow Steps

### Step 1: Load Reference Data

Load the captured patterns as reference:

```python
import json
from pathlib import Path

captured_dir = Path('~/.claude/skills/boss-ui-ux/captured').expanduser()

with open(captured_dir / 'colors-extracted.json') as f:
    colors = json.load(f)

with open(captured_dir / 'components-catalog.json') as f:
    components = json.load(f)

with open(captured_dir / 'spacing.json') as f:
    spacing = json.load(f)
```

### Step 2: Identify What to Validate

Choose validation scope:
- **Single file**: One component file
- **Directory**: All components in a folder
- **Full scan**: Entire src directory

### Step 3: Run Validation Script

```bash
# Validate single file
python scripts/compare_to_captured.py --file src/components/NewCard.tsx

# Validate directory
python scripts/compare_to_captured.py --dir src/components/

# Full scan
python scripts/compare_to_captured.py --dir src/ --recursive
```

### Step 4: Review Validation Report

The validation script checks:

**Color Consistency**
- Are background colors from the captured palette?
- Are text colors matching captured values?
- Are any hardcoded hex values (#xxxxxx) not in palette?

**Component Structure**
- Do cards use `.card` class?
- Do buttons use `.btn-*` classes?
- Do badges use `.badge-*` classes?

**Spacing Patterns**
- Are padding values from captured ranges?
- Are gap values consistent?
- Are border-radius values matching?

### Step 5: Address Issues

For each issue found:

1. **Wrong color**: Replace with captured color class
   ```tsx
   // Bad
   <div className="bg-gray-900">

   // Good (from captured)
   <div className="bg-space-secondary">
   ```

2. **Missing component class**: Add the standard class
   ```tsx
   // Bad
   <div className="rounded-xl border p-6">

   // Good
   <div className="card">
   ```

3. **Inconsistent spacing**: Use captured spacing
   ```tsx
   // Bad
   <div className="p-5">

   // Good (common captured values: p-4, p-6, p-8)
   <div className="p-6">
   ```

## Manual Validation Checklist

If not using the script, manually check:

### Colors
- [ ] Background colors use `space-*` tokens
- [ ] Accent colors use `neon-*` tokens
- [ ] Text uses `gray-100/400/500` or `neon-*`
- [ ] No hardcoded hex colors

### Components
- [ ] Cards have `.card` class
- [ ] Buttons have `.btn-*` class
- [ ] Badges have `.badge-*` class
- [ ] Inputs have `.input` class
- [ ] Status indicators have `.status-*` class

### Animations
- [ ] Transitions use `duration-200` or `duration-300`
- [ ] Hover states use `hover:scale-[1.02]` on cards
- [ ] Button press uses `active:scale-[0.98]`
- [ ] Framer Motion for page/modal animations

### Typography
- [ ] Primary font is Inter (default)
- [ ] Code/data uses JetBrains Mono (font-mono)
- [ ] Text sizes match captured scale

### Layout
- [ ] Uses flex/grid patterns from captured
- [ ] Gaps match captured values (gap-4, gap-6)
- [ ] Container max-width is `max-w-7xl`

## Validation Report Format

```markdown
## UI Consistency Validation Report

**File**: src/components/NewFeature.tsx
**Date**: 2025-12-16
**Reference**: captured/ data from 2025-12-16

### Passed
- [x] Uses .card class correctly
- [x] Button uses .btn-primary
- [x] Text colors from palette

### Warnings
- [ ] Line 45: padding `p-5` not in captured patterns (common: p-4, p-6)
- [ ] Line 67: `text-blue-500` should be `text-neon-blue`

### Errors
- [ ] Line 23: Hardcoded color `#1a1a2e` - use `bg-space-secondary`

### Recommendations
1. Replace custom padding with standard values
2. Use semantic color tokens
```

## Integration with Code Review

When reviewing UI PRs:

1. Run validation script on changed files
2. Check screenshots against captured references
3. Verify new patterns are documented if intentional
4. Request re-capture if design has legitimately changed
