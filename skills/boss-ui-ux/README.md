---
name: boss-ui-ux
description: |
  BOSS Exchange UI/UX agent that learns from the live application.
  Captures existing patterns via Playwright, generates matching components,
  and validates UI consistency against the actual app.

  USE WHEN user says 'create component', 'generate UI', 'validate UI',
  'capture design', 'learn patterns', 'screenshot app', 'match existing',
  'new button', 'new modal', 'new card', 'check styling', 'design system',
  'BOSS styling', 'space cockpit', 'capture UI', 'UI patterns'
---

# BOSS UI/UX Agent

## Core Principle

**LEARN from the existing app, don't prescribe new patterns.**

This skill captures the live BOSS frontend to understand:
- What colors are actually used
- How components are actually styled
- What spacing patterns exist
- How animations behave

The **live application is the source of truth** - all design knowledge is extracted from it.

## When to Activate

- Creating new React/TSX components for BOSS Exchange
- Generating buttons, cards, modals, forms, pages
- Validating UI components match design system
- Capturing live UI screenshots with Playwright
- Discovering existing UI patterns
- Updating design documentation
- Questions about BOSS styling patterns

## Decision Tree

```
User Task → What kind of work?
│
├─ "Capture/Learn" (first-time or refresh)
│   └─ Run capture-and-learn workflow
│       1. Verify frontend running at http://localhost:5189
│       2. Run capture_all_pages.py - screenshot all pages
│       3. Run extract_design_tokens.py - extract colors, fonts, spacing
│       4. Run discover_components.py - catalog component patterns
│       5. Update captured/*.json files
│       6. Regenerate CLAUDE.md with extracted data
│
├─ "Generate Component"
│   └─ Check captured/ data exists?
│       ├─ No → Run capture-and-learn first
│       └─ Yes →
│           1. Read CLAUDE.md for learned patterns
│           2. Identify closest existing pattern
│           3. Generate using captured patterns
│           4. Validate output matches captured data
│
├─ "Validate UI"
│   └─ Compare code against captured patterns
│       1. Load captured/colors-extracted.json
│       2. Load captured/components-catalog.json
│       3. Scan target file(s)
│       4. Report deviations from captured patterns
│
└─ "Update Knowledge"
    └─ Re-run capture when UI has changed
        1. Run all capture scripts
        2. Regenerate CLAUDE.md
        3. Update templates if patterns changed
```

## Quick Reference

### Frontend Location
- **Source**: `C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\generations\exchange\`
- **URL**: `http://localhost:5189`
- **Start command**: `cd autonomous-coding/generations/exchange && npm run dev`

### Captured Data Files
| File | Content |
|------|---------|
| `captured/colors-extracted.json` | All colors from live DOM |
| `captured/typography.json` | Font families, sizes, weights |
| `captured/spacing.json` | Padding/margin patterns |
| `captured/components-catalog.json` | Component patterns found |
| `captured/screenshots/*.png` | Visual references |

### Scripts
```bash
# Capture screenshots of all pages
python scripts/capture_all_pages.py --url http://localhost:5189

# Extract design tokens from live DOM
python scripts/extract_design_tokens.py --url http://localhost:5189

# Discover and catalog components
python scripts/discover_components.py --url http://localhost:5189

# Validate a component file against captured patterns
python scripts/compare_to_captured.py --file path/to/Component.tsx
```

## Workflows

| Workflow | Purpose | When to Use |
|----------|---------|-------------|
| `capture-and-learn.md` | Full UI capture | First use, or UI changed |
| `generate-component.md` | Create new component | User needs new UI |
| `validate-consistency.md` | Check UI matches | Before PR, code review |
| `update-knowledge.md` | Refresh captured data | Design updates |

## Supplementary Resources

- **Full patterns**: `read CLAUDE.md` (auto-generated from capture)
- **Workflows**: `read workflows/*.md`
- **Captured data**: `read captured/*.json`
- **Templates**: `read templates/*.tsx`

## Integration with webapp-testing

This skill uses the same Playwright patterns as `webapp-testing`:
- `sync_playwright()` for browser automation
- `page.wait_for_load_state('networkidle')` before inspection
- `page.evaluate()` for DOM extraction
- Screenshot capture for visual reference

## Quick Start

1. **First time**: Run capture workflow to learn the app
   ```
   Read workflows/capture-and-learn.md and execute steps
   ```

2. **Generate component**: Use learned patterns
   ```
   Read CLAUDE.md for patterns, then generate matching code
   ```

3. **Validate**: Check against captured reference
   ```
   python scripts/compare_to_captured.py --file src/components/NewThing.tsx
   ```
